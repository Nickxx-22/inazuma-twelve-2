import { BASE_URL } from '../config'

function getHeaders() {
  const token = localStorage.getItem('inazuma-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── Local (para cuando no hay usuario logueado) ──────────────────
const KEY = 'inazuma-my-team'

export function saveTeamLocal({ name, slots }) {
  localStorage.setItem(KEY, JSON.stringify({ name, slots }))
}

export function loadTeamLocal() {
  const stored = localStorage.getItem(KEY)
  return stored ? JSON.parse(stored) : null
}

export function clearTeamLocal() {
  localStorage.removeItem(KEY)
}

// ── API (para usuarios logueados) ────────────────────────────────
export async function saveTeamAPI(nombre, equipo) {
  const response = await fetch(`${BASE_URL}/api/mis-equipos/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ nombre_equipo: nombre, equipo })
  })
  if (!response.ok) throw new Error('Error al guardar el equipo')
  return response.json()
}

export async function loadTeamAPI() {
  const response = await fetch(`${BASE_URL}/api/mis-equipos/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al cargar el equipo')
  return response.json()
}

export async function deleteTeamAPI(nombre) {
  const response = await fetch(`${BASE_URL}/api/mis-equipos/`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ nombre_equipo: nombre })
  })
  if (!response.ok) throw new Error('Error al eliminar el equipo')
  return response.json()
}