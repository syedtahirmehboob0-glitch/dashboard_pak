// Live market feed for PakPulse: latest + last 30 days of daily USD-based rates,
// converted to PKR figures the dashboard uses. Source: fawazahmed0/currency-api (free, no key).
const TOLA_G = 11.6638
const TROY_OZ_G = 31.1035
const DAYS = 30

type Rates = Record<string, number>
type Point = {
  date: string
  usdpkr: number
  eurpkr: number
  gbppkr: number
  sarpkr: number
  aedpkr: number
  gold: number
  silver: number
}

const urls = (d: string) => [
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${d}/v1/currencies/usd.min.json`,
  `https://${d}.currency-api.pages.dev/v1/currencies/usd.min.json`,
]

async function fetchDay(d: string): Promise<Point | null> {
  for (const url of urls(d)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
      if (!res.ok) continue
      const json = (await res.json()) as { date: string; usd: Rates }
      const r = json.usd
      if (!r || !validDate(json.date) || !validPositiveRate(r.pkr)) continue
      const pkr = r.pkr
      if (![r.eur, r.gbp, r.sar, r.aed, r.xau, r.xag].every(validPositiveRate)) continue
      const round = (n: number, p = 2) => Math.round(n * 10 ** p) / 10 ** p
      return {
        date: json.date,
        usdpkr: round(pkr),
        eurpkr: round(pkr / r.eur),
        gbppkr: round(pkr / r.gbp),
        sarpkr: round(pkr / r.sar),
        aedpkr: round(pkr / r.aed),
        // xau/xag are troy ounces per 1 USD → PKR per tola
        gold: Math.round((pkr / r.xau / TROY_OZ_G) * TOLA_G),
        silver: Math.round((pkr / r.xag / TROY_OZ_G) * TOLA_G),
      }
    } catch {
      // try the fallback mirror
    }
  }
  return null
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function validPositiveRate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export default async () => {
  const today = new Date()
  const dates = ['latest']
  for (let i = 1; i < DAYS; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }

  const results = await Promise.all(dates.map(fetchDay))
  const byDate = new Map<string, Point>()
  for (const p of results) if (p) byDate.set(p.date, p)
  const history = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))

  if (!history.length) {
    return Response.json({ error: 'Live feed unavailable' }, { status: 502 })
  }

  return Response.json(
    {
      source: 'fawazahmed0/currency-api (daily reference rates)',
      fetchedAt: today.toISOString(),
      latest: history[history.length - 1],
      history,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=1800, stale-while-revalidate=3600',
      },
    },
  )
}

export const config = { path: '/api/live' }
