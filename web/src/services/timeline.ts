import type { Play } from '../model/play'
import { localDate, localHour, weekday } from './dates'
import { PLAY_THRESHOLD_MS } from './stats'

const DAY_MS = 24 * 60 * 60 * 1000

// Time listened in each local day, as a Map "2024-01-31" -> ms.
function msPerDay(plays: Play[]): Map<string, number> {
  const days = new Map<string, number>()
  for (const p of plays) {
    const day = localDate(p.ts)
    days.set(day, (days.get(day) ?? 0) + p.msPlayed)
  }
  return days
}

// RF-4: time listened in each month.
export function msPerMonth(plays: Play[]) {
  const months = new Map<string, number>()
  for (const [day, ms] of msPerDay(plays)) {
    const month = day.slice(0, 7)
    months.set(month, (months.get(month) ?? 0) + ms)
  }
  return [...months].sort().map(([month, ms]) => ({ month, ms }))
}

// RF-5: time listened per day of the week (rows, Monday first) and hour (columns).
export function heatmap(plays: Play[]): number[][] {
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0))
  for (const p of plays) {
    grid[weekday(localDate(p.ts))][localHour(p.ts)] += p.msPlayed
  }
  return grid
}

// RF-6: the day with the most listening.
export function bestDay(plays: Play[]) {
  let best: { day: string; ms: number } | null = null
  for (const [day, ms] of msPerDay(plays)) {
    if (!best || ms > best.ms) best = { day, ms }
  }
  return best
}

// RF-6: the longest run of consecutive days with any listening.
export function longestStreak(plays: Play[]) {
  const days = [...msPerDay(plays).keys()].sort()
  let best = { days: 0, from: '', to: '' }
  let start = 0

  for (let i = 0; i < days.length; i++) {
    const isNext = i > 0 && Date.parse(days[i]) - Date.parse(days[i - 1]) === DAY_MS
    if (!isNext) start = i
    if (i - start + 1 > best.days) best = { days: i - start + 1, from: days[start], to: days[i] }
  }
  return best
}

// RF-7: the track with the most plays in a single day.
export function obsession(plays: Play[]) {
  type Entry = { name: string; track: string; artist: string | null; day: string; plays: number }
  const counts = new Map<string, Entry>()
  let best: Entry | null = null

  for (const p of plays) {
    if (!p.uri || p.msPlayed < PLAY_THRESHOLD_MS) continue
    const day = localDate(p.ts)
    const key = `${day}|${p.uri}`
    const entry = counts.get(key) ?? { name: `${p.track} - ${p.artist}`, track: p.track, artist: p.artist, day, plays: 0 }
    entry.plays++
    counts.set(key, entry)
    if (!best || entry.plays > best.plays) best = entry
  }
  return best
}
