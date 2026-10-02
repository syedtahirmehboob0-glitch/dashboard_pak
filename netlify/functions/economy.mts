// Government-source economic feed for PakPulse.
// Sources: Pakistan Stock Exchange (PSX), Board of Investment (BOI), Pakistan Bureau of Statistics (PBS).

const PSX = "https://dps.psx.com.pk/"
const BOI = "https://invest.gov.pk/statistics"
const PBS = "https://www.pbs.gov.pk/"
const OGRA_DAILY = "https://price.ogra.org.pk/?category=price-publications&section=daily-fuel"
const OGRA_LEGACY = "https://ogra.org.pk/index.php/notified-petroleum-prices"

const clean = (s: string) => s.replace(/\s+/g, " ").trim()
const num = (s: string) => {
  const n = Number(String(s).replace(/,/g, "").replace(/%/g, ""))
  return Number.isFinite(n) ? n : null
}

async function get(url: string) {
  const r = await fetch(url, {
    signal: AbortSignal.timeout(9000),
    headers: { "User-Agent": "PakPulse/2.0 government-data-dashboard" }
  })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return await r.text()
}

function parsePSX(html: string) {
  const h = clean(html)
  const m = h.match(/KSE100\s+([\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)\s+\((-?[\d.]+)%\)/i)
  const panel = h.match(/Total Trades\s+([\d,]+)\s+Advance\s+([\d,]+)\s+Decline\s+([\d,]+)\s+Unchanged\s+([\d,]+)\s+Total\s+([\d,]+)\s+Exchange Volume\s+([\d,]+)\s+Exchange Value\s+([\d,]+)/i)
  return {
    kse100: m ? num(m[1]) : null,
    change: m ? num(m[2]) : null,
    changePct: m ? num(m[3]) : null,
    totalTrades: panel ? num(panel[1]) : null,
    advances: panel ? num(panel[2]) : null,
    declines: panel ? num(panel[3]) : null,
    unchanged: panel ? num(panel[4]) : null,
    volume: panel ? num(panel[7]) : null,
    value: panel ? num(panel[8]) : null,
    source: PSX
  }
}

function parseFuel(html: string) {
  const h = clean(html)
  const find = (patterns: RegExp[]) => {
    for (const re of patterns) {
      const m = h.match(re)
      if (m) {
        const v = num(m[1])
        if (v != null && v > 100 && v < 1000) return v
      }
    }
    return null
  }
  return {
    petrol: find([/Petrol[^\d]{0,180}(\d{2,3}(?:\.\d{1,2})?)/i, /Motor\s+Spirit[^\d]{0,180}(\d{2,3}(?:\.\d{1,2})?)/i]),
    diesel: find([/High\s*Speed\s*Diesel[^\d]{0,180}(\d{2,3}(?:\.\d{1,2})?)/i, /HSD[^\d]{0,180}(\d{2,3}(?:\.\d{1,2})?)/i]),
    source: OGRA_DAILY
  }
}

function parsePBSHome(html: string) {
  const h = clean(html)
  const spi = h.match(/Weekly Sensitive Price Indicator.*?(?:Week Ended|week ended).*?(\d+(?:\.\d+)?)%/i)
  return { spi: spi ? num(spi[1]) : null, source: PBS }
}

function findLatestPBSReport(html: string) {
  const re = /href=["']([^"']*monthly-inflation-report[^"']*)["'][^>]*>([^<]*Monthly Inflation Report[^<]*)</ig
  let m: RegExpExecArray | null = null, found = null
  while ((m = re.exec(html))) found = m[1]
  if (!found) return null
  return found.startsWith("http") ? found : new URL(found, PBS).toString()
}

function parseCPIReport(html: string) {
  const h = clean(html)
  const m = h.match(/CPI inflation General.*?increased by\s+(\d+(?:\.\d+)?)%.*?year-on-year/i)
  return m ? num(m[1]) : null
}

function parseBOI(html: string) {
  const h = clean(html)
  const totalMatch = h.match(/2024-25\s*\(Jul-Jan\).*?Total\s+([\d,.]+)/i)
  const total = totalMatch ? num(totalMatch[1]) : null
  const sector = (name: string) => {
    const re = new RegExp(name + "\\s+([^|]+?)(?=\\s+[A-Z][A-Za-z &()]+\\s+-?\\d|\\s+Total\\s+)", "i")
    const m = h.match(re)
    if (!m) return null
    const vals = m[1].match(/-?\d+(?:,\d{3})?(?:\.\d+)?/g) || []
    return vals.length ? num(vals[vals.length - 1]) : null
  }
  return {
    fdiFY25JulJan: total,
    sectors: {
      power: sector("Power"),
      financial: sector("Financial Business"),
      oilGas: sector("Oil & Gas"),
      construction: sector("Construction"),
      trade: sector("Trade"),
      chemicals: sector("Chemicals"),
      textiles: sector("Textiles"),
      itTelecom: sector("Communication")
    },
    source: BOI,
    note: "FY2024-25 Jul-Jan, USD million."
  }
}

export default async () => {
  const fetchedAt = new Date().toISOString()
  const [psxR, boiR, pbsR, ograR, ograLegacyR] = await Promise.allSettled([get(PSX), get(BOI), get(PBS), get(OGRA_DAILY), get(OGRA_LEGACY)])
  const errors: string[] = []
  const psx = psxR.status === "fulfilled" ? parsePSX(psxR.value) : (errors.push("PSX unavailable"), null)
  const boi = boiR.status === "fulfilled" ? parseBOI(boiR.value) : (errors.push("BOI unavailable"), null)
  const fuelHtml = ograR.status === "fulfilled" ? ograR.value : (ograLegacyR.status === "fulfilled" ? ograLegacyR.value : null)
  const fuel = fuelHtml ? parseFuel(fuelHtml) : null
  if (!fuel?.petrol) errors.push("OGRA petrol unavailable")

  let cpi = null, spi = null, cpiAsOf = null, spiAsOf = null
  if (pbsR.status === "fulfilled") {
    const home = parsePBSHome(pbsR.value)
    spi = home.spi
    const latestReport = findLatestPBSReport(pbsR.value)
    if (latestReport) {
      try {
        const reportHtml = await get(latestReport)
        cpi = parseCPIReport(reportHtml)
        cpiAsOf = new Date().toISOString().slice(0,10)
      } catch {
        errors.push("PBS CPI report unavailable")
      }
    }
    if (spi != null) spiAsOf = new Date().toISOString().slice(0,10)
    if (cpi == null) errors.push("PBS CPI unavailable")
    if (spi == null) errors.push("PBS SPI unavailable")
  } else errors.push("PBS unavailable")

  return Response.json({
    fetchedAt,
    status: errors.length ? "partial" : "ok",
    errors,
    market: psx,
    investment: boi,
    fuel: fuel ? { ...fuel, asof: new Date().toISOString().slice(0,10) } : null,
    macro: { cpi, cpiAsOf, spi, spiAsOf, source: PBS },
    sources: { psx: PSX, boi: BOI, pbs: PBS }
  }, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Netlify-CDN-Cache-Control": "public, durable, s-maxage=900, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*"
    }
  })
}

export const config = { path: "/api/economy" }
