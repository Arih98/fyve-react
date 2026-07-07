const RAW_API_BASE = process.env.REACT_APP_API_BASE || window.location.origin
const API_ORIGIN = RAW_API_BASE.replace(/\/wp-json\/?$/, '').replace(/\/$/, '')
const API_BASE = `${API_ORIGIN}/wp-json`

const CART_TOKEN_KEY = 'woo_store_cart_token'

function getStoredCartToken() {
  return localStorage.getItem(CART_TOKEN_KEY) || ''
}

function setStoredCartToken(token) {
  if (token) {
    localStorage.setItem(CART_TOKEN_KEY, token)
  }
}

export function clearStoredCartToken() {
  localStorage.removeItem(CART_TOKEN_KEY)
  localStorage.removeItem('woo_store_nonce')
}

export async function apiRequest(path, options = {}) {
  const storedCartToken = getStoredCartToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (storedCartToken) {
    headers.set('Cart-Token', storedCartToken)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers
  })

  const responseCartToken = res.headers.get('Cart-Token')

  if (responseCartToken) {
    setStoredCartToken(responseCartToken)
  }

  const raw = await res.text()
  let data = null

  try {
    data = raw ? JSON.parse(raw) : null
  } catch (error) {
    data = raw
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}