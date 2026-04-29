const API_BASE = `https://fyvelondon.com/wp-json`

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
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const hasBody = options.body !== undefined && options.body !== null
  const method = (options.method || 'GET').toUpperCase()
  const storedCartToken = getStoredCartToken()
  const isStoreApiRequest = path.startsWith('/wc/store/')

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (storedCartToken && isStoreApiRequest && method !== 'GET') {
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

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}