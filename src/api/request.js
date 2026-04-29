const API_BASE = `https://fyvelondon.com/wp-json`

const CART_TOKEN_KEY = 'woo_store_cart_token'
const NONCE_KEY = 'woo_store_nonce'

function getStoredCartToken() {
  return localStorage.getItem(CART_TOKEN_KEY) || ''
}

function setStoredCartToken(token) {
  if (token) {
    localStorage.setItem(CART_TOKEN_KEY, token)
  }
}

function getStoredNonce() {
  return localStorage.getItem(NONCE_KEY) || ''
}

function setStoredNonce(nonce) {
  if (nonce) {
    localStorage.setItem(NONCE_KEY, nonce)
  }
}

export function clearStoredCartToken() {
  localStorage.removeItem(CART_TOKEN_KEY)
  localStorage.removeItem(NONCE_KEY)
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const method = (options.method || 'GET').toUpperCase()
  const hasBody = options.body !== undefined && options.body !== null
  const isStoreApiRequest = path.startsWith('/wc/store/')

  if (hasBody && !headers.has('Content-Type') && !(options.body instanceof URLSearchParams)) {
    headers.set('Content-Type', 'application/json')
  }

  if (isStoreApiRequest && method !== 'GET') {
    const storedNonce = getStoredNonce()
    const storedCartToken = getStoredCartToken()

    if (storedNonce && !headers.has('Nonce')) {
      headers.set('Nonce', storedNonce)
    }

    if (storedCartToken && !headers.has('Cart-Token')) {
      headers.set('Cart-Token', storedCartToken)
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers
  })

  const responseCartToken = res.headers.get('Cart-Token')
  const responseNonce = res.headers.get('Nonce')

  if (responseCartToken) {
    setStoredCartToken(responseCartToken)
  }

  if (responseNonce) {
    setStoredNonce(responseNonce)
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}