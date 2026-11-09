import { useState } from 'react'
import type { Play } from '../model/play'
import { parseHistory } from '../services/historyParser'
import { filterByRange } from '../services/dates'
import { dedupe, distinctValues, totals } from '../services/stats'
import MoreStats from './MoreStats'
import { top, topByMonth, type Ranked, type TopBy } from '../services/tops'
import { useImages } from './useImages'

export default function App() {
  const [plays, setPlays] = useState<Play[]>([])
  const [duplicates, setDuplicates] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  async function onFiles(files: FileList | null) {
    if (!files) return
    setError(null)
    try {
      const all: Play[] = []
      for (const file of files) {
        all.push(...parseHistory(await file.text()))
      }
      const unique = dedupe(all)
      setDuplicates(all.length - unique.length)
      setPlays(unique)
    } catch {
      setError('Could not read the files. Are they Spotify history JSON files?')
    }
  }

  const filtered = filterByRange(plays, from || null, to || null)
  const t = totals(filtered)
  const tops = (['artist', 'track', 'album'] as TopBy[]).map((by) => ({
    by,
    byTime: top(filtered, by, 'time', 10),
    byPlays: top(filtered, by, 'plays', 10),
  }))
  const monthlyArtists = topByMonth(filtered, 'artist')
  const monthlyAlbums = topByMonth(filtered, 'album')

  // Tracks show their album cover; artists show the artist picture.
  const ranked = (by: TopBy) => tops.filter((x) => x.by === by).flatMap((x) => [...x.byTime, ...x.byPlays])
  const artistImages = useImages('artists', [...ranked('artist'), ...monthlyArtists].map((r) => r.uri))
  const albumImages = useImages('albums', [...ranked('track'), ...ranked('album'), ...monthlyAlbums].map((r) => r.uri))
  const imagesFor = (by: TopBy) => (by === 'artist' ? artistImages : albumImages)

  return (
    <main>
      <h1>Spotify Stats</h1>
      <input type="file" accept=".json" multiple onChange={(e) => onFiles(e.target.files)} />
      {error && <p>{error}</p>}
      {plays.length > 0 && (
        <>
          <p>
            From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            {' '}to <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </p>
          <ul>
            <li>Plays: {t.plays}</li>
            <li>Listened: {Math.round(t.listenedMs / 60_000)} min</li>
            <li>Tracks: {t.tracks}</li>
            <li>Artists: {t.artists}</li>
            <li>Albums: {t.albums}</li>
            <li>From {t.from} to {t.to}</li>
            <li>Duplicates removed: {duplicates}</li>
            <li>reason_start: {distinctValues(plays, 'reasonStart').join(', ')}</li>
            <li>reason_end: {distinctValues(plays, 'reasonEnd').join(', ')}</li>
            <li>platform: {distinctValues(plays, 'platform').join(', ')}</li>
          </ul>
          {tops.map(({ by, byTime, byPlays }) => (
            <div key={by}>
              <h2>Top {by}s</h2>
              <TopList title="By time" items={byTime} images={imagesFor(by)} />
              <TopList title="By plays" items={byPlays} images={imagesFor(by)} />
            </div>
          ))}
          <h2>Top per month</h2>
          <ul>
            {monthlyArtists.map((m) => (
              <li key={m.month}><Cover uri={m.uri} images={artistImages} />{m.month}: {m.name}</li>
            ))}
          </ul>
          <ul>
            {monthlyAlbums.map((m) => (
              <li key={m.month}><Cover uri={m.uri} images={albumImages} />{m.month}: {m.name}</li>
            ))}
          </ul>
          <MoreStats plays={filtered} />
        </>
      )}
    </main>
  )
}

function TopList({ title, items, images }: { title: string; items: Ranked[]; images: Map<string, string> }) {
  return (
    <>
      <h3>{title}</h3>
      <ol>
        {items.map((item) => (
          <li key={item.name}><Cover uri={item.uri} images={images} />{item.name} ({item.plays} plays, {Math.round(item.ms / 60_000)} min)</li>
        ))}
      </ol>
    </>
  )
}

// Decorative (empty alt): the name is written right next to it.
function Cover({ uri, images }: { uri: string | null; images: Map<string, string> }) {
  const src = uri ? images.get(uri) : undefined
  return src ? <img src={src} alt="" width={40} height={40} className="cover" /> : null
}
