import { describe, expect, it } from 'vitest'
import type { Play } from './history'
import { dedupe, totals } from './stats'

const play = (over: Partial<Play>): Play => ({
  ts: '2024-01-01T00:00:00Z',
  msPlayed: 60_000,
  track: 'A',
  artist: 'X',
  album: 'Z',
  uri: 'spotify:track:a',
  platform: null,
  reasonStart: null,
  reasonEnd: null,
  shuffle: null,
  skipped: null,
  offline: null,
  ...over,
})

describe('dedupe', () => {
  it('keeps one record per ts + uri', () => {
    const plays = [play({}), play({}), play({ ts: '2024-01-02T00:00:00Z' })]
    expect(dedupe(plays)).toHaveLength(2)
  })
})

describe('totals', () => {
  it('counts plays only from 30 s but sums all listened time', () => {
    const plays = [play({ msPlayed: 60_000 }), play({ msPlayed: 10_000, uri: 'spotify:track:b' })]
    const t = totals(plays)
    expect(t.plays).toBe(1)
    expect(t.listenedMs).toBe(70_000)
  })

  it('counts distinct tracks, artists and albums', () => {
    const plays = [
      play({}),
      play({ uri: 'spotify:track:b', artist: 'Y', album: 'W' }),
      play({ uri: 'spotify:track:b', artist: 'Y', album: 'W' }),
    ]
    const t = totals(plays)
    expect([t.tracks, t.artists, t.albums]).toEqual([2, 2, 2])
  })

  it('returns the date range', () => {
    const plays = [play({ ts: '2024-03-01T00:00:00Z' }), play({ ts: '2024-01-01T00:00:00Z' })]
    const t = totals(plays)
    expect([t.from, t.to]).toEqual(['2024-01-01T00:00:00Z', '2024-03-01T00:00:00Z'])
  })
})
