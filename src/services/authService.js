import { BASE_URL } from '../config'

export function getUser() {
  const stored = localStorage.getItem('inazuma-user')
  return stored ? JSON.parse(stored) : null
}

export async function loginUser({ username, password }) {
  const response = await fetch(`${BASE_URL}/api/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión')
  localStorage.setItem('inazuma-token', data.token)
  localStorage.setItem('inazuma-user', JSON.stringify(data.usuario))
  window.dispatchEvent(new Event('auth-change'))
  return data.usuario
}

export async function registerUser({ username, email, password, confirm_password }) {
  const response = await fetch(`${BASE_URL}/api/registro/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, confirm_password })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Error en el registro')
  localStorage.setItem('inazuma-token', data.token)
  localStorage.setItem('inazuma-user', JSON.stringify(data.usuario))
  window.dispatchEvent(new Event('auth-change'))
  return data.usuario
}

export function logoutUser() {
  localStorage.removeItem('inazuma-user')
  localStorage.removeItem('inazuma-token')
  localStorage.removeItem('inazuma-my-team')
  window.dispatchEvent(new Event('auth-change'))
}