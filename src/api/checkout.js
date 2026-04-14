import { apiRequest } from './request'

export function getCheckoutPrefill() {
  return apiRequest('/fyve-checkout/v1/prefill')
}

export function getCheckoutData() {
  return apiRequest('/wc/store/v1/checkout')
}

export function updateCheckoutCustomer(payload) {
  return apiRequest('/wc/store/v1/cart/update-customer', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function selectShippingRate(packageId, rateId) {
  return apiRequest('/wc/store/v1/cart/select-shipping-rate', {
    method: 'POST',
    body: JSON.stringify({
      package_id: packageId,
      rate_id: rateId
    })
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