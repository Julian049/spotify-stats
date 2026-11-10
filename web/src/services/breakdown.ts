import type { Play } from '../model/play'
import { localDate } from './dates'
import { PLAY_THRESHOLD_MS } from './stats'
import { bestDay } from './timeline'

// The raw platform string includes OS versions and device models; we keep only the family.
export function platformFamily(platform: string | null): string {
  const p = (platform ?? '').toLowerCase()
  if (p.startsWith('android')) return 'Android'
  if (p.startsWith('ios')) return 'iOS'
  if (p.startsWith('os x') || p.startsWith('macos')) return 'Mac'
  if (p.startsWith('windows')) return 'Windows'
  if (p.startsWith('web_player')) return 'Web player'
  if (p.startsWith('linux')) return 'Linux'
  if (p.includes('tv') || p.includes('cast') || p.startsWith('partner')) return 'TV'
  return 'Unknown'
}

// RF-8: time listened and plays (30 s or more) per device family, most listened first.
export function msByPlatform(plays: Play[]) {
  const families = new Map<string, { name: string; ms: number; plays: number }>()
  for (const p of plays) {
    const name = platformFamily(p.platform)
    const family = families.get(name) ?? { name, ms: 0, plays: 0 }
    family.ms += p.msPlayed
    if (p.msPlayed >= PLAY_THRESHOLD_MS) family.plays++
    families.set(name, family)
  }
  return [...families.values()].sort((a, b) => b.ms - a.ms)
}

// RF-10: time listened with shuffle on and off. Records with a null shuffle are left out.
export function msByShuffle(plays: Play[]) {
  let on = 0
  let off = 0
  for (const p of plays) {
    if (p.shuffle === true) on += p.msPlayed
    else if (p.shuffle === false) off += p.msPlayed
  }
  return { on, off }
}

// RF-11: time listened offline, the offline day with the most listening and how many records it had.
export function offlineStats(plays: Play[]) {
  const offline = plays.filter((p) => p.offline === true)
  const best = bestDay(offline)
  return {
    ms: offline.reduce((sum, p) => sum + p.msPlayed, 0),
    bestDay: best,
    bestDayTracks: best ? offline.filter((p) => localDate(p.ts) === best.day).length : 0,
  }
}
