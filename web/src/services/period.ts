export type Preset = 'weeks' | 'months' | 'year' | 'all'
export type Range = { from: string | null; to: string | null }

const DAY_MS = 24 * 60 * 60 * 1000
const toDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const toMs = (day: string) => Date.parse(`${day}T00:00:00Z`)

export function addDays(day: string, n: number): string {
  return toDay(toMs(day) + n * DAY_MS)
}

// Both days included.
export function daysBetween(from: string, to: string): number {
  return Math.round((toMs(to) - toMs(from)) / DAY_MS) + 1
}

// Ranges end on the last day of the history, not today: an export can be months old.
export function presetRange(preset: Preset, lastDay: string): Range {
  switch (preset) {
    case 'weeks':
      return { from: addDays(lastDay, -27), to: lastDay }
    case 'months': {
      // Same day six months back, clamped to that month's length (Aug 31 -> Feb 29), then the next day.
      const [y, m, d] = lastDay.split('-').map(Number)
      const back = new Date(Date.UTC(y, m - 7, 1))
      const monthLength = new Date(Date.UTC(back.getUTCFullYear(), back.getUTCMonth() + 1, 0)).getUTCDate()
      back.setUTCDate(Math.min(d, monthLength))
      return { from: addDays(toDay(back.getTime()), 1), to: lastDay }
    }
    case 'year':
      return { from: `${lastDay.slice(0, 4)}-01-01`, to: `${lastDay.slice(0, 4)}-12-31` }
    case 'all':
      return { from: null, to: null }
  }
}

// The range of the same length right before this one, to compare against.
export function previousRange(from: string, to: string): { from: string; to: string } {
  const length = daysBetween(from, to)
  return { from: addDays(from, -length), to: addDays(from, -1) }
}
