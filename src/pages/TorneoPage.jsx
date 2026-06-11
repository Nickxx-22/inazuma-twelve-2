import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Shield, Swords, Play, ChevronRight, Loader2, Star, Target, Zap } from 'lucide-react'
import { BASE_URL, imgUrl } from '../config'
import styles from './TorneoPage.module.css'

function getStoredSession() {
  try {
    const u = localStorage.getItem('inazuma-user')
    const t = localStorage.getItem('inazuma-token')
    return { user: u ? JSON.parse(u) : null, token: t || null }
  } catch { return { user: null, token: null } }
}

const RONDA_NOMBRES = {
  1: 'Dieciseisavos', 2: 'Octavos',
  3: 'Cuartos', 4: 'Semifinal', 5: 'Final'
}

// ── Componente de evento del partido ──────────────────────────
function EventoItem({ evento }) {
  const [showVideo, setShowVideo] = useState(false)

  const tecVideo = evento.tecnica?.tiro?.video_url
    || evento.tecnica?.parada?.video_url
    || evento.tecnica?.regate?.video_url
    || evento.tecnica?.robo?.video_url

  const iconMap = {
    tiro:    '⚽',
    regate:  '💨',
    robo:    '🛡️',
    ocasion: '🎯',
    penaltis:'🥅',
  }

  const colorMap = {
    tiro:    evento.es_gol ? '#36d399' : '#3d7eff',
    regate:  '#f59e0b',
    robo:    '#f471b5',
    ocasion: '#ff6b35',
    penaltis:'#a78bfa',
  }

  const color = colorMap[evento.tipo] || '#6b7a9e'

  return (
    <>
      <div
        className={`${styles.evento} ${evento.es_gol ? styles.eventoGol : ''}`}
        style={{ borderLeftColor: color }}
        onClick={() => tecVideo && setShowVideo(true)}
      >
        <div className={styles.eventoMinuto} style={{ color }}>
          {evento.minuto}'
        </div>
        <div className={styles.eventoIcono}>{iconMap[evento.tipo] || '⚡'}</div>
        <p className={styles.eventoDesc}>{evento.descripcion}</p>
        {tecVideo && (
          <button className={styles.eventoVideoBtn} style={{ color }}>
            <Play size={12} fill="currentColor" /> Ver
          </button>
        )}
      </div>

      {showVideo && tecVideo && (
        <div className={styles.videoOverlay} onClick={() => setShowVideo(false)}>
          <div className={styles.videoModal} onClick={e => e.stopPropagation()}>
            <button className={styles.videoClose} onClick={() => setShowVideo(false)}>✕</button>
            <p className={styles.videoTitle}>
              {evento.tecnica?.tiro?.nombre || evento.tecnica?.parada?.nombre
               || evento.tecnica?.regate?.nombre || evento.tecnica?.robo?.nombre}
            </p>
            <video autoPlay loop playsInline className={styles.videoPlayer}>
              <source src={imgUrl(tecVideo)} type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </>
  )
}

// ── Componente del cuadro del torneo ──────────────────────────
function CuadroBracket({ cuadro, rondaActual }) {
  const ronda1 = cuadro?.ronda_1 || []
  return (
    <div className={styles.bracket}>
      <h3 className={styles.bracketTitle}>
        {RONDA_NOMBRES[rondaActual] || `Ronda ${rondaActual}`}
      </h3>
      <div className={styles.bracketGrid}>
        {ronda1.map((match, i) => (
          <div key={i} className={`${styles.bracketMatch} ${match.jugado ? styles.bracketMatchJugado : ''}`}>
            <div className={`${styles.bracketTeam} ${match.local?.es_usuario ? styles.bracketTeamUser : ''}`}>
              {match.local?.nombre}
            </div>
            {match.jugado && match.resultado && (
              <div className={styles.bracketScore}>
                {match.resultado.goles_local} - {match.resultado.goles_visitante}
              </div>
            )}
            <div className={`${styles.bracketTeam} ${match.visitante?.es_usuario ? styles.bracketTeamUser : ''}`}>
              {match.visitante?.nombre}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Componente de estadísticas ────────────────────────────────
function EstadisticasPanel({ stats }) {
  if (!stats) return null
  return (
    <div className={styles.statsPanel}>
      <h3 className={styles.statsPanelTitle}><Trophy size={16} /> Estadísticas del torneo</h3>

      <div className={styles.statsResumen}>
        <div className={styles.statsResumenItem}>
          <span className={styles.statsResumenNum}>{stats.partidos_jugados}</span>
          <span className={styles.statsResumenLbl}>Partidos</span>
        </div>
        <div className={styles.statsResumenItem}>
          <span className={styles.statsResumenNum} style={{ color: '#36d399' }}>{stats.partidos_ganados}</span>
          <span className={styles.statsResumenLbl}>Victorias</span>
        </div>
        <div className={styles.statsResumenItem}>
          <span className={styles.statsResumenNum} style={{ color: '#ff6b35' }}>{stats.goles_marcados}</span>
          <span className={styles.statsResumenLbl}>Goles</span>
        </div>
        <div className={styles.statsResumenItem}>
          <span className={styles.statsResumenNum} style={{ color: '#f471b5' }}>{stats.ronda_alcanzada}</span>
          <span className={styles.statsResumenLbl}>Ronda</span>
        </div>
      </div>

      {stats.goleadores?.length > 0 && (
        <div className={styles.statsGroup}>
          <h4 className={styles.statsGroupTitle}><Target size={13} /> Goleadores</h4>
          {stats.goleadores.map((g, i) => (
            <div key={i} className={styles.statsRow}>
              <span className={styles.statsRank}>#{i + 1}</span>
              <span className={styles.statsNombre}>{g.nombre}</span>
              <span className={styles.statsVal} style={{ color: '#36d399' }}>{g.goles} goles</span>
            </div>
          ))}
        </div>
      )}

      {stats.porteros?.length > 0 && (
        <div className={styles.statsGroup}>
          <h4 className={styles.statsGroupTitle}><Shield size={13} /> Mejores porteros</h4>
          {stats.porteros.map((p, i) => (
            <div key={i} className={styles.statsRow}>
              <span className={styles.statsRank}>#{i + 1}</span>
              <span className={styles.statsNombre}>{p.nombre}</span>
              <span className={styles.statsVal} style={{ color: '#3d7eff' }}>{p.paradas} paradas</span>
            </div>
          ))}
        </div>
      )}

      {stats.regates?.length > 0 && (
        <div className={styles.statsGroup}>
          <h4 className={styles.statsGroupTitle}><Zap size={13} /> Mejores regates</h4>
          {stats.regates.map((r, i) => (
            <div key={i} className={styles.statsRow}>
              <span className={styles.statsRank}>#{i + 1}</span>
              <span className={styles.statsNombre}>{r.nombre}</span>
              <span className={styles.statsVal} style={{ color: '#f59e0b' }}>{r.regates} regates</span>
            </div>
          ))}
        </div>
      )}

      {stats.robos?.length > 0 && (
        <div className={styles.statsGroup}>
          <h4 className={styles.statsGroupTitle}><Shield size={13} /> Mejores robos</h4>
          {stats.robos.map((r, i) => (
            <div key={i} className={styles.statsRow}>
              <span className={styles.statsRank}>#{i + 1}</span>
              <span className={styles.statsNombre}>{r.nombre}</span>
              <span className={styles.statsVal} style={{ color: '#f471b5' }}>{r.robos} robos</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────
export default function TorneoPage() {
  const navigate = useNavigate()
  const { user, token } = getStoredSession()

  const [fase, setFase]         = useState('inicio')   // inicio | previo | simulando | resultado | finalizado
  const [torneo, setTorneo]     = useState(null)
  const [misEquipos, setMisEquipos] = useState({})
  const [equipoSel, setEquipoSel]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Resultado del último partido
  const [eventos, setEventos]   = useState([])
  const [marcador, setMarcador] = useState({ local: 0, visitante: 0, nombreLocal: '', nombreVisitante: '' })
  const [resultado, setResultado] = useState(null)
  const [statsPartido, setStatsPartido] = useState(null)

  // Cargar equipos del usuario al montar
  useEffect(() => {
    if (!user) { navigate('/login'); return }
    async function cargar() {
      try {
        const res  = await fetch(`${BASE_URL}/obtener_usuario/${user.id || user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) {
          const eqs = data.usuario?.equipos || {}
          setMisEquipos(eqs)
          const nombres = Object.keys(eqs)
          if (nombres.length > 0) setEquipoSel(nombres[0])
        }
      } catch (e) { console.error(e) }
    }
    cargar()
  }, [])

  // Crear torneo
  async function handleCrearTorneo() {
    if (!equipoSel) { setError('Selecciona un equipo primero'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${BASE_URL}/torneos/crear`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ nombre_equipo: equipoSel })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setTorneo(data)
      setFase('previo')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Simular partido
  async function handleSimular() {
    setLoading(true); setFase('simulando'); setError('')
    try {
      const res  = await fetch(`${BASE_URL}/torneos/${torneo.torneo_id}/simular`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ nombre_equipo: equipoSel })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Buscar nombres del partido en el cuadro
      const ronda_key  = `ronda_${torneo.ronda_actual || 1}`
      const enfrentamientos = torneo.cuadro?.[ronda_key] || []
      const match = enfrentamientos.find(e => e.local?.es_usuario || e.visitante?.es_usuario)
      const nombreLocal     = match?.local?.nombre     || equipoSel
      const nombreVisitante = match?.visitante?.nombre || 'Rival'

      setEventos(data.eventos || [])
      setMarcador({
        local:      data.goles_local,
        visitante:  data.goles_visitante,
        nombreLocal,
        nombreVisitante,
      })
      setResultado(data.resultado)
      setStatsPartido(data.estadisticas_partido)

      // Actualizar torneo con nueva ronda/estado
      setTorneo(prev => ({
        ...prev,
        ronda_actual: data.ronda_actual,
        estado:       data.torneo_estado,
      }))

      setFase(data.torneo_estado === 'finalizado' ? 'finalizado' : 'resultado')
    } catch (e) {
      setError(e.message)
      setFase('previo')
    } finally {
      setLoading(false)
    }
  }

  // Continuar al siguiente partido
  async function handleSiguiente() {
    // Recargar torneo actualizado
    setLoading(true)
    try {
      const res  = await fetch(`${BASE_URL}/torneos/${torneo.torneo_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setTorneo(data)
      setEventos([])
      setFase('previo')
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ── FASE: INICIO ─────────────────────────────────────────────
  if (fase === 'inicio') return (
    <div className={styles.page}>
      <div className={styles.heroSection}>
        <div className={styles.heroIcon}><Trophy size={40} /></div>
        <h1 className={styles.heroTitle}>Modo Torneo</h1>
        <p className={styles.heroSub}>Selecciona tu equipo y compite en un torneo de 16 equipos</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {Object.keys(misEquipos).length === 0 ? (
        <div className={styles.noEquipo}>
          <Shield size={32} />
          <p>No tienes equipos guardados</p>
          <button className={styles.btnPrimary} onClick={() => navigate('/mi-equipo')}>
            Crear mi equipo
          </button>
        </div>
      ) : (
        <div className={styles.startCard}>
          <label className={styles.selectLabel}>Elige tu equipo</label>
          <select
            value={equipoSel}
            onChange={e => setEquipoSel(e.target.value)}
            className={styles.equipoSelect}
          >
            {Object.keys(misEquipos).map(nombre => (
              <option key={nombre} value={nombre}>{nombre}</option>
            ))}
          </select>

          <div className={styles.equipoPreview}>
            <p className={styles.equipoPreviewTitle}>{equipoSel}</p>
            <p className={styles.equipoPreviewSub}>
              {(misEquipos[equipoSel] || []).filter(s => s.characterId).length} / 11 jugadores
            </p>
          </div>

          <button
            className={styles.btnStart}
            onClick={handleCrearTorneo}
            disabled={loading}
          >
            {loading
              ? <><Loader2 size={18} className={styles.spin} /> Sorteando equipos...</>
              : <><Trophy size={18} /> Participar en el torneo</>
            }
          </button>
        </div>
      )}
    </div>
  )

  // ── FASE: PREVIO ─────────────────────────────────────────────
  if (fase === 'previo') {
    const ronda_key = `ronda_${torneo.ronda_actual || 1}`
    const enfrentamientos = torneo.cuadro?.[ronda_key] || []
    const miPartido = enfrentamientos.find(e => e.local?.es_usuario || e.visitante?.es_usuario)
    const rival = miPartido?.local?.es_usuario ? miPartido.visitante : miPartido?.local

    return (
      <div className={styles.page}>
        <div className={styles.rondaHeader}>
          <span className={styles.rondaBadge}>{RONDA_NOMBRES[torneo.ronda_actual] || `Ronda ${torneo.ronda_actual}`}</span>
          <h2 className={styles.rondaTitle}>Próximo partido</h2>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.matchPreview}>
          <div className={styles.matchTeam}>
            <div className={styles.matchTeamAvatar} style={{ background: '#3d7eff22', borderColor: '#3d7eff44' }}>
              <Shield size={28} style={{ color: '#3d7eff' }} />
            </div>
            <span className={styles.matchTeamName}>{equipoSel}</span>
            <span className={styles.matchTeamLabel}>Tu equipo</span>
          </div>

          <div className={styles.matchVs}>VS</div>

          <div className={styles.matchTeam}>
            <div className={styles.matchTeamAvatar} style={{ background: '#ff6b3522', borderColor: '#ff6b3544' }}>
              <Swords size={28} style={{ color: '#ff6b35' }} />
            </div>
            <span className={styles.matchTeamName}>{rival?.nombre || '???'}</span>
            <span className={styles.matchTeamLabel}>Rival</span>
          </div>
        </div>

        <CuadroBracket cuadro={torneo.cuadro} rondaActual={torneo.ronda_actual} />

        <button className={styles.btnStart} onClick={handleSimular} disabled={loading}>
          {loading
            ? <><Loader2 size={18} className={styles.spin} /> Simulando...</>
            : <><Play size={18} fill="currentColor" /> Jugar partido</>
          }
        </button>
      </div>
    )
  }

  // ── FASE: SIMULANDO ──────────────────────────────────────────
  if (fase === 'simulando') return (
    <div className={styles.page}>
      <div className={styles.loadingPartido}>
        <Loader2 size={48} className={styles.spin} />
        <p>Simulando el partido...</p>
      </div>
    </div>
  )

  // ── FASE: RESULTADO ──────────────────────────────────────────
  if (fase === 'resultado' || fase === 'finalizado') return (
    <div className={styles.page}>

      {/* Marcador */}
      <div className={`${styles.marcador} ${resultado === 'victoria' ? styles.marcadorVictoria : styles.marcadorDerrota}`}>
        <div className={styles.marcadorEquipo}>{marcador.nombreLocal}</div>
        <div className={styles.marcadorScore}>
          <span>{marcador.local}</span>
          <span className={styles.marcadorGuion}>-</span>
          <span>{marcador.visitante}</span>
        </div>
        <div className={styles.marcadorEquipo}>{marcador.nombreVisitante}</div>
      </div>

      <div className={`${styles.resultadoBadge} ${resultado === 'victoria' ? styles.resultadoVictoria : styles.resultadoDerrota}`}>
        {resultado === 'victoria' ? '🏆 ¡Victoria!' : '💔 Eliminado'}
      </div>

      {/* Feed de eventos */}
      <div className={styles.feedSection}>
        <h3 className={styles.feedTitle}>Resumen del partido</h3>
        <div className={styles.feed}>
          {eventos.map((ev, i) => <EventoItem key={i} evento={ev} />)}
        </div>
      </div>

      {/* Stats del partido */}
      {statsPartido && (
        <div className={styles.statsPartidoSection}>
          <h3 className={styles.feedTitle}>Estadísticas del partido</h3>
          <div className={styles.statsPartidoGrid}>
            {statsPartido.goleadores?.length > 0 && (
              <div className={styles.statsPartidoGroup}>
                <h4>⚽ Goleadores</h4>
                {statsPartido.goleadores.map((g, i) => (
                  <div key={i} className={styles.statsRow}>
                    <span className={styles.statsNombre}>{g.nombre}</span>
                    <span className={styles.statsVal}>{g.goles}</span>
                  </div>
                ))}
              </div>
            )}
            {statsPartido.porteros?.length > 0 && (
              <div className={styles.statsPartidoGroup}>
                <h4>🧤 Porteros</h4>
                {statsPartido.porteros.map((p, i) => (
                  <div key={i} className={styles.statsRow}>
                    <span className={styles.statsNombre}>{p.nombre}</span>
                    <span className={styles.statsVal}>{p.paradas}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botones */}
      <div className={styles.accionesFinal}>
        {fase === 'resultado' && resultado === 'victoria' && (
          <button className={styles.btnStart} onClick={handleSiguiente}>
            <ChevronRight size={18} /> Siguiente ronda
          </button>
        )}
        {fase === 'finalizado' && (
          <>
            {resultado === 'victoria' && (
              <div className={styles.campeonBanner}>
                <Star size={32} style={{ color: '#f59e0b' }} />
                <p>¡¡¡CAMPEÓN DEL TORNEO!!!</p>
              </div>
            )}
            <EstadisticasPanel stats={torneo.estadisticas} />
            <button className={styles.btnSecondary} onClick={() => { setFase('inicio'); setTorneo(null) }}>
              Nuevo torneo
            </button>
          </>
        )}
        <button className={styles.btnSecondary} onClick={() => navigate('/mi-equipo')}>
          Volver a Mi Equipo
        </button>
      </div>
    </div>
  )

  return null
}