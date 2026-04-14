const API_BASE = 'https://yourwordpressdomain.com/wp-json'

export async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}