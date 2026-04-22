import { apiRequest } from './request'

export function getCheckoutPrefill() {
  return apiRequest('/fyve-checkout/v1/prefill')
}

export function getCheckoutData() {
  return apiRequest('/wc/store/v1/checkout')
}

export function updateCheckoutCustomer(payload) {
  return apiRequest('/fyve-checkout/v1/update-customer', {
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

export function updateCheckoutDraft(payload) {
  return apiRequest('/wc/store/v1/checkout?__experimental_calc_totals=true', {
    method: 'PUT',
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

export function clearCheckoutCart() {
  return apiRequest('/fyve-checkout/v1/clear-cart', {
    method: 'POST'
  })
}

export function confirmRevolutPayment(orderId) {
  return apiRequest(`/fyve-checkout/v1/confirm-revolut-payment/${orderId}`, {
    method: 'POST'
  })
}

export function updateRevolutOrderDetails(payload) {
  return apiRequest('/fyve-checkout/v1/update-revolut-order-details', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function applyCoupon(code) {
  return apiRequest('/wc/store/v1/cart/apply-coupon', {
    method: 'POST',
    body: JSON.stringify({ code })
  })
}

export function removeCoupon(code) {
  return apiRequest('/wc/store/v1/cart/remove-coupon', {
    method: 'POST',
    body: JSON.stringify({ code })
  })
}