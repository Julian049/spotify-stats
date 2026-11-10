import { describe, expect, it } from 'vitest'
import type { Play } from '../../src/model/play'
import { msByPlatform, msByShuffle, offlineStats, platformFamily } from '../../src/services/breakdown'

const play = (over: Partial<Play>): Play => ({
  ts: '2024-01-15T12:00:00Z',
  msPlayed: 60_000,
  track: 'T',
  artist: 'A',
  album: 'Al',
  uri: 'spotify:track:t',
  platform: null,
  reasonStart: null,
  reasonEnd: null,
  shuffle: null,
  skipped: null,
  offline: null,
  ...over,
})

describe('platformFamily', () => {
  it('groups raw platform strings by family', () => {
    expect(platformFamily('Android OS 11 API 30 (realme, RMX2001)')).toBe('Android')
    expect(platformFamily('Android-tablet OS 9 API 28 (HUAWEI, xyz )')).toBe('Android')
    expect(platformFamily('Windows 10 (10.0.19041; x64; AppX)')).toBe('Windows')
    expect(platformFamily('web_player windows 10;chrome 74;desktop')).toBe('Web player')
    expect(platformFamily('iOS 17.1 (iPhone14,2)')).toBe('iOS')
    expect(platformFamily('OS X 10.15.7 [x86 8]')).toBe('Mac')
    expect(platformFamily('Partner android_tv Sony')).toBe('TV')
    expect(platformFamily('not_applicable')).toBe('Unknown')
    expect(platformFamily(null)).toBe('Unknown')
  })
})

describe('msByPlatform', () => {
  it('sums time per family, most listened first', () => {
    const plays = [play({ platform: 'android' }), play({ platform: 'windows', msPlayed: 90_000 }), play({ platform: 'Android OS 10' })]
    expect(msByPlatform(plays)).toEqual([
      { name: 'Android', ms: 120_000, plays: 2 },
      { name: 'Windows', ms: 90_000, plays: 1 },
    ])
  })
})

describe('msByShuffle', () => {
  it('splits time between shuffle on and off and ignores null', () => {
    const plays = [play({ shuffle: true }), play({ shuffle: false, msPlayed: 30_000 }), play({ shuffle: null })]
    expect(msByShuffle(plays)).toEqual({ on: 60_000, off: 30_000 })
  })
})

describe('offlineStats', () => {
  it('only counts offline records', () => {
    const plays = [
      play({ offline: true, ts: '2024-01-10T12:00:00Z' }),
      play({ offline: true, ts: '2024-01-11T12:00:00Z', msPlayed: 45_000 }),
      play({ offline: true, ts: '2024-01-11T13:00:00Z', msPlayed: 45_000 }),
      play({ offline: false, msPlayed: 999_000 }),
    ]
    expect(offlineStats(plays)).toEqual({ ms: 150_000, bestDay: { day: '2024-01-11', ms: 90_000 }, bestDayTracks: 2 })
  })
})
