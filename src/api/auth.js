import { apiRequest } from './request'

export function login(email, password) {
  return apiRequest('/fyve-auth/v1/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export function loginUser(email, password) {
  return login(email, password)
}

export function register(payload) {
  return apiRequest('/fyve-auth/v1/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function registerUser(payload) {
  return register(payload)
}

export function logout() {
  return apiRequest('/fyve-auth/v1/logout', {
    method: 'POST'
  })
}

export function logoutUser() {
  return logout()
}

export function getMe() {
  return apiRequest('/fyve-auth/v1/me')
}

export function getCurrentUser() {
  return getMe()
}

export function forgotPassword(email) {
  return apiRequest('/fyve-auth/v1/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

export function resetPassword(payload) {
  return apiRequest('/fyve-auth/v1/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}