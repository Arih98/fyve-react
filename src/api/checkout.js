import { apiRequest } from './request'

export function getCheckoutPrefill() {
  return apiRequest('/fyve-checkout/v1/prefill')
}

export function getCheckoutCart() {
  return apiRequest('/fyve-checkout/v1/cart')
}

export function updateCheckoutCustomer(payload) {
  return apiRequest('/fyve-checkout/v1/update-customer', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function selectShippingMethod(payload) {
  return apiRequest('/fyve-checkout/v1/select-shipping', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function createCheckoutOrder(payload) {
  return apiRequest('/fyve-checkout/v1/create-order', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function createRevolutOrder(payload) {
  return apiRequest('/fyve-checkout/v1/create-revolut-order', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function getCheckoutOrderStatus(orderId) {
  return apiRequest(`/fyve-checkout/v1/order-status/${orderId}`)
}