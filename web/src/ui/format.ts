// es-CO groups thousands from 4 digits (1.420), like the design. Dates use es-ES for "1 ene 2023".
const numberFormat = new Intl.NumberFormat('es-CO')
const shortDay = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const longDay = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const monthShort = new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' })
const monthLong = new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' })

const asDate = (day: string) => new Date(`${day.slice(0, 10)}T00:00:00Z`)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const num = (n: number) => numberFormat.format(Math.round(n))
export const minutes = (ms: number) => Math.round(ms / 60_000)
export const hours = (ms: number) => Math.round(ms / 3_600_000)

// 0.246 -> "24,6%"
export function percent(share: number, digits = 0): string {
  return `${(share * 100).toLocaleString('es-CO', { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`
}

// 34_920_000 -> "9h 42m"
export function hoursMinutes(ms: number): string {
  const total = Math.round(ms / 60_000)
  return `${Math.floor(total / 60)}h ${total % 60}m`
}

export const shortDate = (day: string) => shortDay.format(asDate(day)).replace('.', '') // "1 ene 2023"
export const longDate = (day: string) => longDay.format(asDate(day)) // "14 de octubre de 2024"
export const monthLabel = (month: string) => `${capitalize(monthShort.format(asDate(`${month}-01`)).replace('.', ''))} ${month.slice(0, 4)}` // "Ene 2024"
export const monthAbbr = (month: string) => capitalize(monthShort.format(asDate(`${month}-01`)).replace('.', '')) // "Ene"
export const monthName = (month: string) => monthLong.format(asDate(`${month}-01`)) // "mayo"
