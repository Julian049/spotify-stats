import { describe, expect, it } from 'vitest'
import { hoursMinutes, longDate, monthAbbr, monthLabel, monthName, num, percent, shortDate } from '../../src/ui/format'

describe('format', () => {
  it('formats like the design', () => {
    expect([num(1420), num(78420.4)]).toEqual(['1.420', '78.420'])
    expect([percent(0.246, 1), percent(0.58)]).toEqual(['24,6%', '58%'])
    expect(hoursMinutes(34_920_000)).toBe('9h 42m')
    expect(shortDate('2023-01-01')).toBe('1 ene 2023')
    expect(longDate('2024-10-14')).toBe('14 de octubre de 2024')
    expect([monthLabel('2024-05'), monthAbbr('2024-01'), monthName('2024-05')]).toEqual(['May 2024', 'Ene', 'mayo'])
  })
})
