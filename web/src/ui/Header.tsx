import exportIcon from '../assets/icons/export.svg'
import logo from '../assets/icons/logo.svg'
import './header.css'

export type View = 'upload' | 'summary' | 'tops' | 'habits'

const TABS: { view: View; label: string }[] = [
  { view: 'summary', label: 'Resumen general' },
  { view: 'tops', label: 'Top artistas y canciones' },
  { view: 'habits', label: 'Hábitos de escucha' },
]

type Props = { view: View; onNavigate: (view: View) => void }

export default function Header({ view, onNavigate }: Props) {
  const inDashboard = view !== 'upload'

  return (
    <header className="header">
      <button className="brand" onClick={() => onNavigate('upload')} title="Cargar archivos">
        <img src={logo} alt="" width={32} height={32} />
        <span>Spotify Stats</span>
      </button>

      {inDashboard && (
        <>
          <nav className="tabs" aria-label="Secciones">
            {TABS.map((t) => (
              <button
                key={t.view}
                className="tab"
                aria-current={view === t.view ? 'page' : undefined}
                onClick={() => onNavigate(t.view)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <button className="export soon" disabled title="Próximamente">
            <img src={exportIcon} alt="" width={11} height={11} />
            Exportar
          </button>
        </>
      )}
    </header>
  )
}
