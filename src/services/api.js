const BASE_URL = import.meta.env.VITE_API_URL

// ── Helper base ──────────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('inazuma-token')

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `Error ${res.status}`)
  }

  return res.json()
}

// ── Auth ─────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => request('/api/login/',    { method: 'POST', body: JSON.stringify(data) }),
  registro: (data) => request('/api/registro/', { method: 'POST', body: JSON.stringify(data) }),
  me:       ()     => request('/api/me/'),
}

// ── Personajes ────────────────────────────────────────────────────
export const personajesAPI = {
  getAll:   (params = '') => request(`/api/personajes/${params}`),
  getOne:   (slug)        => request(`/api/personajes/${slug}/`),
}

// ── Técnicas ─────────────────────────────────────────────────────
export const tecnicasAPI = {
  getAll: (params = '') => request(`/api/tecnicas/${params}`),
  getOne: (slug)        => request(`/api/tecnicas/${slug}/`),
}

// ── Equipos ──────────────────────────────────────────────────────
export const equiposAPI = {
  getAll: () => request('/api/equipos/'),
  getOne: (slug) => request(`/api/equipos/${slug}/`),
}

// ── Favoritos ────────────────────────────────────────────────────
export const favoritosAPI = {
  getJugadores:    ()     => request('/api/favoritos/'),
  toggleJugador:   (slug) => request('/api/favoritos/toggle/',          { method: 'POST', body: JSON.stringify({ slug }) }),
  getTecnicas:     ()     => request('/api/favoritos/tecnicas/'),
  toggleTecnica:   (slug) => request('/api/favoritos/tecnicas/toggle/', { method: 'POST', body: JSON.stringify({ slug }) }),
}

// ── Mi Equipo ────────────────────────────────────────────────────
export const misEquiposAPI = {
  get:    ()             => request('/api/mis-equipos/'),
  save:   (nombre, equipo) => request('/api/mis-equipos/', { method: 'POST', body: JSON.stringify({ nombre_equipo: nombre, equipo }) }),
  delete: (nombre)       => request('/api/mis-equipos/', { method: 'DELETE', body: JSON.stringify({ nombre_equipo: nombre }) }),
}

// ── Torneos ──────────────────────────────────────────────────────
export const torneosAPI = {
  crear:    (nombre_equipo)          => request('/api/torneos/',                          { method: 'POST', body: JSON.stringify({ nombre_equipo }) }),
  historial: ()                      => request('/api/torneos/historial/'),
  detalle:  (id)                     => request(`/api/torneos/${id}/`),
  simular:  (id, nombre_equipo)      => request(`/api/torneos/${id}/simular/`,            { method: 'POST', body: JSON.stringify({ nombre_equipo }) }),
}