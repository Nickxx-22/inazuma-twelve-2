import { BASE_URL } from '../config'

function getHeaders() {
  const token = localStorage.getItem('inazuma-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getAllPlayers(params = '') {
  const response = await fetch(`${BASE_URL}/api/personajes/${params}`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al cargar jugadores')
  return response.json()
}

export async function getPlayerBySlug(slug) {
  const response = await fetch(`${BASE_URL}/api/personajes/${slug}/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al cargar el jugador')
  return response.json()
}

export async function toggleFavorito(slug) {
  const response = await fetch(`${BASE_URL}/api/favoritos/toggle/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ slug })
  })
  if (!response.ok) throw new Error('Error al actualizar favorito')
  return response.json()
}

export async function getFavoritos() {
  const response = await fetch(`${BASE_URL}/api/favoritos/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al cargar favoritos')
  return response.json()
}