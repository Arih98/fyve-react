import { apiRequest } from './request'

export function getStoreCart() {
  return apiRequest('/wc/store/v1/cart')
}

export function addStoreCartItem(payload) {
  const params = new URLSearchParams()

  if (payload.id) {
    params.set('id', String(payload.id))
  }

  if (payload.quantity) {
    params.set('quantity', String(payload.quantity))
  }

  if (payload.variation && Array.isArray(payload.variation)) {
    payload.variation.forEach((item, index) => {
      params.set(`variation[${index}][attribute]`, item.attribute)
      params.set(`variation[${index}][value]`, item.value)
    })
  }

  return apiRequest(`/wc/store/v1/cart/items?${params.toString()}`, {
    method: 'POST'
  })
}

export function updateStoreCartItem(key, quantity) {
  return apiRequest(`/wc/store/v1/cart/items/${key}?quantity=${encodeURIComponent(quantity)}`, {
    method: 'PUT'
  })
}

export function removeStoreCartItem(key) {
  return apiRequest(`/wc/store/v1/cart/items/${key}`, {
    method: 'DELETE'
  })
}