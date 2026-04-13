const API_BASE = 'https://dev.fyvelondon.com/wp-json/fyve-auth/v1';

export async function getCurrentUser() {
  console.log('[API] GET /me');

  const response = await fetch(`${API_BASE}/me`, {
    credentials: 'include'
  });

  console.log('[API] /me status:', response.status);

  const data = await response.json();

  console.log('[API] /me data:', data);

  return data;
}

export async function loginUser({ email, password }) {
  console.log('[API] POST /login', { email });

  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  console.log('[API] /login status:', response.status);

  const data = await response.json();

  console.log('[API] /login data:', data);

  return data;
}

export async function registerUser({ firstName, lastName, email, password }) {
  console.log('[API] POST /register', { email });

  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      password
    })
  });

  console.log('[API] /register status:', response.status);

  const data = await response.json();

  console.log('[API] /register data:', data);

  return data;
}

export async function logoutUser() {
  console.log('[API] POST /logout');

  const response = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  console.log('[API] /logout status:', response.status);

  const data = await response.json();

  console.log('[API] /logout data:', data);

  return data;
}