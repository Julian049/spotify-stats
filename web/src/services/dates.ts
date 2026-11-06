import type { Play } from '../model/play'

export const TIME_ZONE = 'America/Bogota'

const formatters = new Map<string, Intl.DateTimeFormat>()

// Converts a UTC timestamp to a local date like "2024-01-31".
export function localDate(ts: string, timeZone = TIME_ZONE): string {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    formatters.set(timeZone, formatter)
  }
  return formatter.format(new Date(ts))
}

// Both limits are local dates ("2024-01-31") and inclusive. null means no limit.
export function filterByRange(plays: Play[], from: string | null, to: string | null, timeZone = TIME_ZONE): Play[] {
  return plays.filter((p) => {
    const day = localDate(p.ts, timeZone)
    return (!from || day >= from) && (!to || day <= to)
  })
}
