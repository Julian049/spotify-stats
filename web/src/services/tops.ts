import type { Play } from '../model/play'
import { localDate } from './dates'
import { PLAY_THRESHOLD_MS } from './stats'

export type TopBy = 'artist' | 'track' | 'album'
// uri: one track of the group, used to look up its album or artist image.
export type Ranked = { name: string; ms: number; plays: number; uri: string | null }

// Each kind of item has its own id (to group) and label (to show).
export const identity: Record<TopBy, (p: Play) => { id: string; label: string } | null> = {
  artist: (p) => (p.artist ? { id: p.artist, label: p.artist } : null),
  track: (p) => (p.uri ? { id: p.uri, label: `${p.track} - ${p.artist}` } : null),
  album: (p) => (p.album ? { id: `${p.artist}|${p.album}`, label: `${p.album} - ${p.artist}` } : null),
}

export function top(plays: Play[], by: TopBy, sortBy: 'time' | 'plays', n: number): Ranked[] {
  const groups = new Map<string, Ranked>()

  for (const p of plays) {
    const item = identity[by](p)
    if (!item) continue
    const group = groups.get(item.id) ?? { name: item.label, ms: 0, plays: 0, uri: null }
    group.uri ??= p.uri
    group.ms += p.msPlayed
    if (p.msPlayed >= PLAY_THRESHOLD_MS) group.plays++
    groups.set(item.id, group)
  }

  const [main, other] = sortBy === 'time' ? (['ms', 'plays'] as const) : (['plays', 'ms'] as const)
  return [...groups.values()].sort((a, b) => b[main] - a[main] || b[other] - a[other]).slice(0, n)
}

// The most listened artist or album of each month, by time listened.
export function topByMonth(plays: Play[], by: 'artist' | 'album') {
  const months = new Map<string, Play[]>()
  for (const p of plays) {
    const month = localDate(p.ts).slice(0, 7)
    const list = months.get(month) ?? []
    list.push(p)
    months.set(month, list)
  }

  return [...months.keys()].sort().flatMap((month) => {
    const best = top(months.get(month)!, by, 'time', 1)[0]
    return best ? [{ month, ...best }] : []
  })
}
