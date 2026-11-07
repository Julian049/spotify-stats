import { describe, expect, it } from 'vitest'
import type { Play } from '../../src/model/play'
import { isSkipped, skipStats, topSkipped } from '../../src/services/skips'

const play = (over: Partial<Play>): Play => ({
  ts: '2024-01-15T12:00:00Z',
  msPlayed: 10_000,
  track: 'T',
  artist: 'A',
  album: 'Al',
  uri: 'spotify:track:t',
  platform: null,
  reasonStart: null,
  reasonEnd: 'fwdbtn',
  shuffle: null,
  skipped: null,
  offline: null,
  ...over,
})

describe('isSkipped', () => {
  it('needs "next" before 30 s', () => {
    expect(isSkipped(play({}))).toBe(true)
    expect(isSkipped(play({ msPlayed: 45_000 }))).toBe(false)
    expect(isSkipped(play({ reasonEnd: 'backbtn' }))).toBe(false)
    expect(isSkipped(play({ reasonEnd: 'trackdone' }))).toBe(false)
  })

  it('ignores the skipped flag', () => {
    expect(isSkipped(play({ skipped: false }))).toBe(true)
    expect(isSkipped(play({ reasonEnd: 'endplay', skipped: true }))).toBe(false)
  })
})

describe('skipStats', () => {
  it('returns the count and the percentage of all records', () => {
    const plays = [play({}), play({ reasonEnd: 'trackdone' }), play({ reasonEnd: 'trackdone' }), play({ reasonEnd: 'trackdone' })]
    expect(skipStats(plays)).toEqual({ skipped: 1, total: 4, percent: 25 })
  })

  it('does not divide by zero', () => {
    expect(skipStats([]).percent).toBe(0)
  })
})

describe('topSkipped', () => {
  it('ranks artists by number of skips', () => {
    const plays = [play({ artist: 'B' }), play({ artist: 'B' }), play({ artist: 'A' }), play({ artist: 'A', reasonEnd: 'trackdone' })]
    expect(topSkipped(plays, 'artist', 5)).toEqual([
      { name: 'B', skips: 2 },
      { name: 'A', skips: 1 },
    ])
  })
})
