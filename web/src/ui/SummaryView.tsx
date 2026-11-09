import { useState, type ReactNode } from 'react'
import activity from '../assets/icons/activity.svg'
import arrowRight from '../assets/icons/arrow-right.svg'
import chevronRight from '../assets/icons/chevron-right.svg'
import disc from '../assets/icons/disc.svg'
import filter from '../assets/icons/filter.svg'
import insights from '../assets/icons/insights.svg'
import moon from '../assets/icons/moon.svg'
import statRepeat from '../assets/icons/stat-repeat.svg'
import statTimer from '../assets/icons/stat-timer.svg'
import statUsers from '../assets/icons/stat-users.svg'
import statWaves from '../assets/icons/stat-waves.svg'
import sun from '../assets/icons/sun.svg'
import trendUpAlt from '../assets/icons/trend-up-alt.svg'
import trendUp from '../assets/icons/trend-up.svg'
import type { Play } from '../model/play'
import { filterByRange, localDate } from '../services/dates'
import { shareOfHours } from '../services/habits'
import { daysBetween, previousRange, type Range } from '../services/period'
import { totals } from '../services/stats'
import { heatmap } from '../services/timeline'
import { top } from '../services/tops'
import Artwork from './Artwork'
import type { View } from './Header'
import { hours, minutes, num, percent, shortDate } from './format'
import { useImages } from './useImages'
import './summary.css'

type Props = {
  plays: Play[]
  allPlays: Play[]
  range: Range
  periodBar: ReactNode
  onNavigate: (view: View) => void
}

const DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const SONGS_STEP = 5
const SONGS_MAX = 50

function greeting(hour: number) {
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function SummaryView({ plays, allPlays, range, periodBar, onNavigate }: Props) {
  const [songsShown, setSongsShown] = useState(SONGS_STEP)
  const [hour] = useState(() => new Date().getHours())

  const t = totals(plays)
  const from = t.from ? localDate(t.from) : null
  const to = t.to ? localDate(t.to) : null
  const days = from && to ? daysBetween(from, to) : 1
  const topArtists = top(plays, 'artist', 'time', 5)
  const songs = top(plays, 'track', 'plays', SONGS_MAX)
  const favorite = songs[0]

  // Compare with the period of the same length right before, only when a period is chosen.
  let change: number | null = null
  if (range.from && range.to) {
    const prev = previousRange(range.from, range.to)
    const prevMs = totals(filterByRange(allPlays, prev.from, prev.to)).listenedMs
    if (prevMs > 0) change = t.listenedMs / prevMs - 1
  }

  const artistImages = useImages('artists', topArtists.map((a) => a.uri))
  const albumImages = useImages('albums', songs.slice(0, songsShown).map((s) => s.uri))

  return (
    <main className="page summary">
      <section className="page-head">
        <div className="page-head-text">
          <p className="eyebrow">
            <span className="dot" />
            Tu historial de escucha
          </p>
          <h1 className="page-title">{greeting(hour)}</h1>
          {from && to && (
            <p className="muted">
              Entre el {shortDate(from)} y el {shortDate(to)} escuchaste {num(minutes(t.listenedMs))} minutos de música
              {topArtists[0] && <>, sobre todo de {topArtists[0].title}</>}
              {favorite && <>, y tu canción más repetida fue «{favorite.title}»</>}.
            </p>
          )}
        </div>
        {periodBar}
      </section>

      <section className="stats">
        <StatCard label="Tiempo total escuchado" icon={statTimer}>
          <p className="stat-value">
            {num(minutes(t.listenedMs))} <small>min</small>
          </p>
          <p className="stat-sub">~{num(t.listenedMs / 86_400_000)} días de música continua</p>
          <p className="stat-foot">
            {change === null ? (
              <span className="muted">En {num(days)} días de historial</span>
            ) : (
              <span className={change >= 0 ? 'green' : 'muted'}>
                {change >= 0 && <img src={trendUp} alt="" width={13} height={8} />}
                {change >= 0 ? '+' : '−'}
                {percent(Math.abs(change))} vs. período anterior
              </span>
            )}
          </p>
        </StatCard>

        <StatCard label="Total de reproducciones" icon={statWaves}>
          <p className="stat-value">{num(t.plays)}</p>
          <p className="stat-sub">reproducciones en total</p>
          <p className="stat-foot green">
            <img src={trendUpAlt} alt="" width={13} height={8} />~{num(t.plays / days)} reproducciones al día
          </p>
        </StatCard>

        <StatCard label="Artistas diferentes" icon={statUsers}>
          <p className="stat-value">{num(t.artists)}</p>
          <p className="stat-sub">artistas únicos explorados</p>
          <p className="stat-foot muted">
            <img src={disc} alt="" width={13} height={13} />
            {num(t.tracks)} canciones · {num(t.albums)} álbumes
          </p>
        </StatCard>

        <StatCard label="Canción más repetida" icon={statRepeat}>
          {favorite ? (
            <>
              <p className="stat-song ellipsis">{favorite.title}</p>
              <p className="stat-sub ellipsis">{favorite.artist}</p>
              <p className="stat-foot spread">
                <span className="green strong">{num(favorite.plays)} reproducciones</span>
                <span className="muted">Tu #1</span>
              </p>
            </>
          ) : (
            <p className="stat-sub">Sin reproducciones de más de 30 s</p>
          )}
        </StatCard>
      </section>

      <section className="artists">
        <div className="section-head">
          <div>
            <h2 className="section-title">Artistas más escuchados</h2>
            <p className="muted small">Por tiempo de escucha en el período elegido.</p>
          </div>
          <button className="link-button" onClick={() => onNavigate('tops')}>
            Ver todos
            <img src={chevronRight} alt="" width={5} height={8} />
          </button>
        </div>
        <div className="artist-grid">
          {topArtists.map((a) => (
            <div key={a.name} className="artist-card card">
              <Artwork className="artist-photo" src={a.uri ? artistImages.get(a.uri) : undefined} name={a.title} />
              <p className="artist-name ellipsis">{a.title}</p>
              <p className="artist-role">Artista</p>
            </div>
          ))}
        </div>
      </section>

      <section className="summary-grid">
        <div className="songs card">
          <div className="section-head">
            <div>
              <h3 className="card-title">Top canciones del período</h3>
              <p className="muted small">Solo cuentan las reproducciones de más de 30 segundos</p>
            </div>
            <button className="chip-button soon" disabled title="Próximamente">
              <img src={filter} alt="" width={12} height={8} />
              Filtrar
            </button>
          </div>

          <div className="songs-table" role="table" aria-label="Top canciones">
            <div className="songs-row songs-header" role="row">
              <span role="columnheader">#</span>
              <span role="columnheader">Título</span>
              <span role="columnheader" className="col-album">
                Álbum
              </span>
              <span role="columnheader" className="num-col">
                Reprod.
              </span>
              <span role="columnheader" className="num-col">
                Tiempo
              </span>
            </div>
            {songs.slice(0, songsShown).map((s, i) => (
              <div key={s.name} className="songs-row" role="row">
                <span role="cell" className="rank">
                  {i + 1}
                </span>
                <span role="cell" className="song-cell">
                  <Artwork className="song-cover" src={s.uri ? albumImages.get(s.uri) : undefined} name={s.title} />
                  <span className="song-text">
                    <strong className={`ellipsis${i === 0 ? ' green' : ''}`}>{s.title}</strong>
                    <span className="muted small ellipsis">{s.artist}</span>
                  </span>
                </span>
                <span role="cell" className="muted small ellipsis col-album">
                  {s.album}
                </span>
                <span role="cell" className="num-col plays-cell">
                  {num(s.plays)}
                </span>
                <span role="cell" className="num-col muted small">
                  {hours(s.ms)} h
                </span>
              </div>
            ))}
          </div>

          <div className="songs-foot">
            <span className="muted small">
              Mostrando {Math.min(songsShown, songs.length)} de {num(t.tracks)} canciones
            </span>
            {songsShown < songs.length && (
              <button className="link-button strong-link" onClick={() => setSongsShown(songsShown + SONGS_STEP)}>
                Ver más canciones
              </button>
            )}
          </div>
        </div>

        <ActivityMap plays={plays} />
      </section>

      <section className="cta">
        <div className="cta-text">
          <div className="cta-icon">
            <img src={insights} alt="" width={26} height={20} />
          </div>
          <div>
            <h4>¿Quieres profundizar en tus cambios de gusto?</h4>
            <p className="muted small">Mira tu artista y álbum de cada mes y cómo fue cambiando lo que escuchas.</p>
          </div>
        </div>
        <button className="pill-button" onClick={() => onNavigate('tops')}>
          Ver cronología
          <img src={arrowRight} alt="" width={12} height={12} />
        </button>
      </section>
    </main>
  )
}

function StatCard({ label, icon, children }: { label: string; icon: string; children: ReactNode }) {
  return (
    <div className="stat card">
      <div className="stat-head">
        <span className="eyebrow">{label}</span>
        <img src={icon} alt="" width={32} height={32} />
      </div>
      <div className="stat-body">{children}</div>
    </div>
  )
}

function ActivityMap({ plays }: { plays: Play[] }) {
  const grid = heatmap(plays)
  const max = Math.max(1, ...grid.flat())
  const night = shareOfHours(plays, 22, 6)
  const morning = shareOfHours(plays, 6, 12)

  return (
    <div className="activity card">
      <div className="section-head">
        <h3 className="card-title with-icon">
          <img src={activity} alt="" width={17} height={17} />
          Mapa de actividad
        </h3>
        <span className="badge green">Hora × día</span>
      </div>
      <p className="muted small">Minutos escuchados por día de la semana y hora. Cuanto más brillante, más escuchas a esa hora.</p>

      <div className="heatmap-box">
        <div className="heatmap" role="img" aria-label="Mapa de calor de escucha por día y hora">
          {grid.map((row, d) => (
            <div key={DAY_LETTERS[d]} className="heatmap-row">
              <span className="heatmap-label">{DAY_LETTERS[d]}</span>
              {row.map((ms, h) => (
                <span
                  key={h}
                  className="heatmap-cell"
                  title={`${DAY_LETTERS[d]} ${String(h).padStart(2, '0')}:00 · ${num(minutes(ms))} min`}
                  style={{ background: `rgba(30, 215, 96, ${ms === 0 ? 0.08 : 0.15 + 0.85 * (ms / max)})` }}
                />
              ))}
            </div>
          ))}
          <div className="heatmap-hours">
            <span />
            {['00', '06', '12', '18', '23'].map((h) => (
              <span key={h} style={{ gridColumn: `${Number(h) + 2}` }}>
                {h}
              </span>
            ))}
          </div>
        </div>
        <div className="heatmap-legend">
          Menos
          {[0.08, 0.3, 0.55, 0.8, 1].map((a) => (
            <span key={a} style={{ background: `rgba(30, 215, 96, ${a})` }} />
          ))}
          Más
        </div>
      </div>

      <div className="daytime">
        <div className="daytime-row">
          <span>
            <img src={moon} alt="" width={15} height={15} />
            Escucha nocturna
          </span>
          <strong className="green">{percent(night)} del total</strong>
        </div>
        <div className="daytime-row">
          <span>
            <img src={sun} alt="" width={16} height={16} />
            Escucha matutina
          </span>
          <strong>{percent(morning)} del total</strong>
        </div>
      </div>
    </div>
  )
}
