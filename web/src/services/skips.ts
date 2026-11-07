import type { Play } from '../model/play'
import { PLAY_THRESHOLD_MS } from './stats'
import { identity, type TopBy } from './tops'

// Skipped = the user pressed "next" before 30 s. The skipped flag and "back" are not used.
export function isSkipped(p: Play): boolean {
  return p.reasonEnd === 'fwdbtn' && p.msPlayed < PLAY_THRESHOLD_MS
}

// RF-9: how many records were skipped and what share of the total that is.
export function skipStats(plays: Play[]) {
  const skipped = plays.filter(isSkipped).length
  return { skipped, total: plays.length, percent: plays.length ? (skipped / plays.length) * 100 : 0 }
}

// RF-9: the artists or tracks skipped most often.
export function topSkipped(plays: Play[], by: Exclude<TopBy, 'album'>, n: number) {
  const groups = new Map<string, { name: string; skips: number }>()

  for (const p of plays.filter(isSkipped)) {
    const item = identity[by](p)
    if (!item) continue
    const group = groups.get(item.id) ?? { name: item.label, skips: 0 }
    group.skips++
    groups.set(item.id, group)
  }
  return [...groups.values()].sort((a, b) => b.skips - a.skips).slice(0, n)
}
