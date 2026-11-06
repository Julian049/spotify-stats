export type Play = {
  ts: string
  msPlayed: number
  track: string
  artist: string | null
  album: string | null
  uri: string | null
  platform: string | null
  reasonStart: string | null
  reasonEnd: string | null
  shuffle: boolean | null
  skipped: boolean | null
  offline: boolean | null
}
