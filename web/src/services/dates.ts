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

const hourFormatters = new Map<string, Intl.DateTimeFormat>()

// Local hour of the day, 0 to 23.
export function localHour(ts: string, timeZone = TIME_ZONE): number {
  let formatter = hourFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' })
    hourFormatters.set(timeZone, formatter)
  }
  return Number(formatter.format(new Date(ts)))
}

// Day of the week of a local date like "2024-01-31": 0 is Monday, 6 is Sunday.
export function weekday(day: string): number {
  return (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7
}
