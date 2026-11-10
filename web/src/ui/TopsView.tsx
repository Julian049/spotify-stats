import { useLayoutEffect, useState, type ReactNode } from 'react'
import award from '../assets/icons/award.svg'
import chevronLeft from '../assets/icons/chevron-left.svg'
import chevronRight from '../assets/icons/chevron-right.svg'
import headphones from '../assets/icons/headphones.svg'
import medal from '../assets/icons/medal.svg'
import note from '../assets/icons/note.svg'
import timeline from '../assets/icons/timeline.svg'
import users from '../assets/icons/users.svg'
import type { Play } from '../model/play'
import { localDate } from '../services/dates'
import { msPerMonth } from '../services/timeline'
import { top, topByMonth, type Ranked } from '../services/tops'
import Artwork from './Artwork'
import { hours, minutes, monthAbbr, monthLabel, monthName, num, percent } from './format'
import { useImages } from './useImages'
import './tops.css'

type Props = { plays: Play[]; periodBar: ReactNode; onLoading: (loading: boolean) => void }
type Metric = 'time' | 'plays'

export default function TopsView({ plays, periodBar, onLoading }: Props) {
  const years = [...new Set(plays.map((p) => localDate(p.ts).slice(0, 4)))].sort()
  const [chosenYear, setYear] = useState<string | null>(null)
  // If the period changes and the chosen year is no longer there, fall back to the latest one.
  const year = chosenYear && years.includes(chosenYear) ? chosenYear : years[years.length - 1]
  const [allAlbums, setAllAlbums] = useState(false)
  const [artistMetric, setArtistMetric] = useState<Metric>('time')
  const [songMetric, setSongMetric] = useState<Metric>('plays')

  const yearPlays = plays.filter((p) => localDate(p.ts).startsWith(year ?? ''))
  const months = msPerMonth(yearPlays)
  const monthArtists = new Map(topByMonth(yearPlays, 'artist').map((m) => [m.month, m]))
  const monthAlbums = new Map(topByMonth(yearPlays, 'album').map((m) => [m.month, m]))
  const peak = months.reduce<(typeof months)[number] | null>((best, m) => (!best || m.ms > best.ms ? m : best), null)

  const albums = top(plays, 'album', 'time', allAlbums ? 30 : 10)
  const artists = top(plays, 'artist', artistMetric, 10)
  const songs = top(plays, 'track', songMetric, 10)

  const { images: artistImages, loading: artistsLoading } = useImages('artists', artists.map((a) => a.uri))
  const { images: albumImages, loading: albumsLoading } = useImages('albums', [
    ...[...monthAlbums.values()].map((m) => m.uri),
    ...albums.map((a) => a.uri),
    ...songs.map((s) => s.uri),
  ])
  // Layout effect: runs before the browser paints, so gray placeholders never flash.
  useLayoutEffect(() => {
    onLoading(artistsLoading || albumsLoading)
    return () => onLoading(false)
  }, [artistsLoading, albumsLoading, onLoading])
  const image = (images: Map<string, string>, uri: string | null) => (uri ? images.get(uri) : undefined)
  const yearIndex = years.indexOf(year ?? '')

  return (
    <main className="page tops">
      <section className="page-head">
        <div className="page-head-text">
          <p className="eyebrow">
            <span className="dot" />
            Rankings e historial
          </p>
          <h1 className="page-title">Rankings y cronología</h1>
          <p className="muted">Tus artistas, canciones y álbumes más escuchados, y quién dominó cada mes del año.</p>
        </div>
        {periodBar}
      </section>

      <section className="timeline card">
        <div className="timeline-head">
          <div>
            <p className="timeline-eyebrow">
              <img src={timeline} alt="" width={15} height={17} />
              Línea de tiempo {year}
            </p>
            <h2 className="card-title">Artista y álbum del mes</h2>
          </div>
          <div className="timeline-controls">
            {peak && (
              <span className="peak-chip">
                Pico: {monthName(peak.month)} ({hours(peak.ms)} h)
              </span>
            )}
            <div className="year-nav">
              <button aria-label="Año anterior" disabled={yearIndex <= 0} onClick={() => setYear(years[yearIndex - 1])}>
                <img src={chevronLeft} alt="" width={5} height={8} />
              </button>
              <button
                aria-label="Año siguiente"
                disabled={yearIndex >= years.length - 1}
                onClick={() => setYear(years[yearIndex + 1])}
              >
                <img src={chevronRight} alt="" width={5} height={8} />
              </button>
            </div>
          </div>
        </div>

        <AreaChart months={months} peakMonth={peak?.month} />

        <div className="month-rail">
          {months.map((m) => {
            const artist = monthArtists.get(m.month)
            const album = monthAlbums.get(m.month)
            const isPeak = m.month === peak?.month
            return (
              <article key={m.month} className={`month-card${isPeak ? ' peak' : ''}`}>
                <div className="month-card-head">
                  <span className="month-chip">
                    {monthLabel(m.month)}
                    {isPeak && ' · Récord'}
                  </span>
                  <span className="month-hours">{hours(m.ms)} h</span>
                </div>
                <div className="month-art">
                  <Artwork src={image(albumImages, album?.uri ?? null)} name={album?.title ?? ''} />
                  <span className="top-chip">
                    <img src={isPeak ? award : medal} alt="" width={isPeak ? 9 : 6} height={12} />
                    {isPeak ? 'Pico' : 'Top 1'}
                  </span>
                </div>
                <p className="month-artist ellipsis">{artist?.title}</p>
                <p className="muted ellipsis">{album?.title}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="albums">
        <div className="section-head">
          <div>
            <h2 className="section-title">Top álbumes históricos</h2>
            <p className="muted small">Los álbumes que más horas sumaron en el período elegido.</p>
          </div>
          <button className="link-button" onClick={() => setAllAlbums(!allAlbums)} aria-expanded={allAlbums}>
            {allAlbums ? 'Ver menos' : 'Ver todos'}
            <img src={chevronRight} alt="" width={5} height={8} className={allAlbums ? 'rotated' : ''} />
          </button>
        </div>
        <div className={`album-rail${allAlbums ? ' expanded' : ''}`}>
          {albums.map((a, i) => (
            <article key={a.name} className="album-card">
              <div className="album-art">
                <Artwork src={image(albumImages, a.uri)} name={a.title} />
                <span className={`rank-badge${i === 0 ? ' first' : ''}`}>#{i + 1}</span>
              </div>
              <h3 className="album-title">{a.title}</h3>
              <p className="muted ellipsis">{a.artist}</p>
              <p className="album-hours">
                <img src={headphones} alt="" width={11} height={11} />
                {hours(a.ms)} h
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="podium">
        <RankList
          title="Top 10 artistas"
          icon={users}
          iconSize={[22, 16]}
          items={artists}
          metric={artistMetric}
          onMetric={setArtistMetric}
          round
          images={artistImages}
          subtitle={(a) => (artistMetric === 'time' ? `${num(minutes(a.ms))} minutos` : `${num(a.plays)} reproducciones`)}
        />
        <RankList
          title="Top 10 canciones"
          icon={note}
          iconSize={[12, 18]}
          items={songs}
          metric={songMetric}
          onMetric={setSongMetric}
          images={albumImages}
          subtitle={(s) => `${s.artist} • ${songMetric === 'time' ? `${num(minutes(s.ms))} min` : `${num(s.plays)} reprod.`}`}
        />
      </section>
    </main>
  )
}

// Smooth area of hours per month; viewBox units, stretched to the card width.
function AreaChart({ months, peakMonth }: { months: { month: string; ms: number }[]; peakMonth?: string }) {
  const W = 1152
  const H = 128
  if (months.length === 0) return <div className="area-chart" />

  const max = Math.max(...months.map((m) => m.ms))
  const step = months.length > 1 ? W / (months.length - 1) : 0
  const points = months.map((m, i) => [months.length > 1 ? i * step : W / 2, H - 24 - (m.ms / max) * (H - 48)])
  let line = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const mid = (x0 + x1) / 2
    line += ` C ${mid} ${y0}, ${mid} ${y1}, ${x1} ${y1}`
  }

  return (
    <div className="area-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1ed760" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1ed760" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill="url(#area-fill)" />
        <path d={line} fill="none" stroke="#1ed760" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="area-labels">
        {months.map((m) => (
          <span key={m.month} className={m.month === peakMonth ? 'peak' : ''}>
            {monthAbbr(m.month)} <span className="area-hours">({hours(m.ms)}h)</span>
          </span>
        ))}
      </div>
    </div>
  )
}

type RankListProps = {
  title: string
  icon: string
  iconSize: [number, number]
  items: Ranked[]
  metric: Metric
  onMetric: (m: Metric) => void
  images: Map<string, string>
  subtitle: (item: Ranked) => string
  round?: boolean
}

function RankList({ title, icon, iconSize, items, metric, onMetric, images, subtitle, round }: RankListProps) {
  const value = (r: Ranked) => (metric === 'time' ? r.ms : r.plays)
  const best = items[0] ? value(items[0]) || 1 : 1

  return (
    <div className="rank-list card">
      <div className="section-head">
        <h2 className="section-title with-icon">
          <img src={icon} alt="" width={iconSize[0]} height={iconSize[1]} />
          {title}
        </h2>
        <div className="segmented" role="group" aria-label="Ordenar por">
          <button aria-pressed={metric === 'time'} onClick={() => onMetric('time')}>
            Tiempo
          </button>
          <button aria-pressed={metric === 'plays'} onClick={() => onMetric('plays')}>
            Reproducciones
          </button>
        </div>
      </div>
      <ol className="rank-items">
        {items.map((r, i) => {
          const share = value(r) / best
          return (
            <li key={r.name} className="rank-item">
              <span className={`rank-number${i === 0 ? ' first' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
              <Artwork className={`rank-art${round ? ' round' : ''}`} src={r.uri ? images.get(r.uri) : undefined} name={r.title} />
              <span className="rank-text">
                <strong className="ellipsis">{r.title}</strong>
                <span className="muted small ellipsis">{subtitle(r)}</span>
              </span>
              <span className="rank-bar">
                <span className="bar">
                  <span style={{ width: `${share * 100}%` }} />
                </span>
                <span className="rank-percent">{percent(share)}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
