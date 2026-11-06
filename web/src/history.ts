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

// Reads one history file and keeps only the fields we use.
// Records without a track name (podcasts, audiobooks) are dropped.
export function parseHistory(text: string): Play[] {
  const records: Record<string, unknown>[] = JSON.parse(text)

  return records
    .filter((r) => typeof r.master_metadata_track_name === 'string')
    .map((r) => ({
      ts: String(r.ts ?? ''),
      msPlayed: Number(r.ms_played ?? 0),
      track: r.master_metadata_track_name as string,
      artist: (r.master_metadata_album_artist_name as string) ?? null,
      album: (r.master_metadata_album_album_name as string) ?? null,
      uri: (r.spotify_track_uri as string) ?? null,
      platform: (r.platform as string) ?? null,
      reasonStart: (r.reason_start as string) ?? null,
      reasonEnd: (r.reason_end as string) ?? null,
      shuffle: (r.shuffle as boolean) ?? null,
      skipped: (r.skipped as boolean) ?? null,
      offline: (r.offline as boolean) ?? null,
    }))
}
