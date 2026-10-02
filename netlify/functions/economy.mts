// Government-source economic feed for PakPulse.
// Sources: Pakistan Stock Exchange (PSX), Board of Investment (BOI), Pakistan Bureau of Statistics (PBS).

const PSX = "https://dps.psx.com.pk/"
const BOI = "https://invest.gov.pk/statistics"
const PBS = "https://www.pbs.gov.pk/"

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
  const [psxR, boiR, pbsR] = await Promise.allSettled([get(PSX), get(BOI), get(PBS)])
  const errors: string[] = []
  const psx = psxR.status === "fulfilled" ? parsePSX(psxR.value) : (errors.push("PSX unavailable"), null)
  const boi = boiR.status === "fulfilled" ? parseBOI(boiR.value) : (errors.push("BOI unavailable"), null)

  let cpi = null
  if (pbsR.status === "fulfilled") {
    const m = clean(pbsR.value).match(/Monthly Consumer Price Index.*?(\d+(?:\.\d+)?)%/i)
    cpi = m ? num(m[1]) : null
  } else errors.push("PBS unavailable")

  return Response.json({
    fetchedAt,
    status: errors.length ? "partial" : "ok",
    errors,
    market: psx,
    investment: boi,
    macro: { cpi, source: PBS },
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
