import type { Play } from '../model/play'

export const PLAY_THRESHOLD_MS = 30_000

// Same ts + same track = the same record repeated across files.
export function dedupe(plays: Play[]): Play[] {
  const seen = new Set<string>()
  return plays.filter((p) => {
    const key = `${p.ts}|${p.uri}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function totals(plays: Play[]) {
  const counted = plays.filter((p) => p.msPlayed >= PLAY_THRESHOLD_MS)
  const dates = plays.map((p) => p.ts).sort()

  return {
    plays: counted.length,
    listenedMs: plays.reduce((sum, p) => sum + p.msPlayed, 0),
    tracks: new Set(plays.map((p) => p.uri)).size,
    artists: new Set(plays.map((p) => p.artist)).size,
    albums: new Set(plays.map((p) => p.album)).size,
    from: dates[0] ?? null,
    to: dates[dates.length - 1] ?? null,
  }
}

// Used to discover the real values of reason_start, reason_end and platform.
export function distinctValues(plays: Play[], field: 'reasonStart' | 'reasonEnd' | 'platform') {
  return [...new Set(plays.map((p) => p[field]))]
}
