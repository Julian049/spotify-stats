import { describe, expect, it } from 'vitest'
import { demoPlays } from '../../src/services/demo'
import { dedupe, totals } from '../../src/services/stats'

describe('demoPlays', () => {
  it('builds the same two years of unique plays on every call', () => {
    const plays = demoPlays()
    expect(plays).toEqual(demoPlays())
    expect(dedupe(plays)).toHaveLength(plays.length)
    const t = totals(plays)
    expect(t.from?.slice(0, 4)).toBe('2023')
    expect(t.artists).toBe(8)
  })
})
