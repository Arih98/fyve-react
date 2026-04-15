const API_BASE = `https://fyvelondon.com/wp-json`

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include'
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed: ${response.status}`)
  }

  return response.json()
}