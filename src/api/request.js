const API_BASE = '/wp-json'

const CART_TOKEN_KEY = `woo_store_cart_token:${window.location.origin}`

function getStoredCartToken() {
  return localStorage.getItem(CART_TOKEN_KEY) || ''
}

function setStoredCartToken(token) {
  if (token) {
    localStorage.setItem(CART_TOKEN_KEY, token)
  }
}

function clearStoredCartToken() {
  localStorage.removeItem(CART_TOKEN_KEY)
}

export async function apiRequest(path, options = {}) {
  const storedCartToken = getStoredCartToken()
  const headers = new Headers(options.headers || {})

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

  if (res.status === 401 || res.status === 403) {
    clearStoredCartToken()
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}