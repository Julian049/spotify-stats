import type { Play } from '../model/play'

export const TIME_ZONE = 'America/Bogota'

const formatters = new Map<string, Intl.DateTimeFormat>()

// Intl is slow (about 1 µs per call) and every screen converts each play several times, which froze
// the page with big histories. Results are cached per timestamp string and time zone.
type Cache<T> = Map<string, Map<string, T>> // time zone -> timestamp -> value
const dates: Cache<string> = new Map()
const hours: Cache<number> = new Map()
const weekdays = new Map<string, number>()

function cached<T>(cache: Cache<T>, ts: string, timeZone: string, compute: () => T): T {
  let byTs = cache.get(timeZone)
  if (!byTs) cache.set(timeZone, (byTs = new Map()))
  let value = byTs.get(ts)
  if (value === undefined) byTs.set(ts, (value = compute()))
  return value
}

// Converts a UTC timestamp to a local date like "2024-01-31".
export function localDate(ts: string, timeZone = TIME_ZONE): string {
  return cached(dates, ts, timeZone, () => {
    let formatter = formatters.get(timeZone)
    if (!formatter) {
      formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
      formatters.set(timeZone, formatter)
    }
    return formatter.format(new Date(ts))
  })
}

// Both limits are local dates ("2024-01-31") and inclusive. null means no limit.
export function filterByRange(plays: Play[], from: string | null, to: string | null, timeZone = TIME_ZONE): Play[] {
  return plays.filter((p) => {
    const day = localDate(p.ts, timeZone)
    return (!from || day >= from) && (!to || day <= to)
  })
}

const hourFormatters = new Map<string, Intl.DateTimeFormat>()

// Local hour of the day, 0 to 23.
export function localHour(ts: string, timeZone = TIME_ZONE): number {
  return cached(hours, ts, timeZone, () => {
    let formatter = hourFormatters.get(timeZone)
    if (!formatter) {
      formatter = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' })
      hourFormatters.set(timeZone, formatter)
    }
    return Number(formatter.format(new Date(ts)))
  })
}

// Day of the week of a local date like "2024-01-31": 0 is Monday, 6 is Sunday.
export function weekday(day: string): number {
  let value = weekdays.get(day)
  if (value === undefined) weekdays.set(day, (value = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7))
  return value
}
