const API_BASE = 'https://fyvelondon.com'

async function parseReturnResponse(response) {
  const raw = await response.text()

  let data = null

  try {
    data = raw ? JSON.parse(raw) : null
  } catch {
    throw new Error(raw || `Request failed with status ${response.status}`)
  }

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.message || data?.msg || `Request failed with status ${response.status}`)
  }

  return data
}

export async function lookupReturnOrder({ orderId, email }) {
  const response = await fetch(`${API_BASE}/wp-json/fyve-returns/v1/lookup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order_id: Number(orderId),
      email: String(email || '').trim()
    })
  })

  return parseReturnResponse(response)
}

export async function createReturnRequest({ orderId, token, returnItems }) {
  const response = await fetch(`${API_BASE}/wp-json/fyve-returns/v1/create`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order_id: Number(orderId),
      token,
      return_items: returnItems
    })
  })

  return parseReturnResponse(response)
}