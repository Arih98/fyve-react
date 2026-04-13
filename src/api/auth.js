const API_BASE = 'https://dev.fyvelondon.com/wp-json/fyve-auth/v1';

export async function getCurrentUser() {
  console.log('[API] GET /me');

  const response = await fetch(`${API_BASE}/me`, {
    credentials: 'include'
  });

  console.log('[API] /me status:', response.status);
  console.log('[API] /me content-type:', response.headers.get('content-type'));

  const rawText = await response.text();

  console.log('[API] /me raw response:', rawText.slice(0, 500));

  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error('[API] /me JSON parse failed');
    throw err;
  }
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
  console.log('[API] /login content-type:', response.headers.get('content-type'));

  const rawText = await response.text();

  console.log('[API] /login raw response:', rawText.slice(0, 500));

  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error('[API] /login JSON parse failed');
    throw err;
  }
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
  console.log('[API] /register content-type:', response.headers.get('content-type'));

  const rawText = await response.text();

  console.log('[API] /register raw response:', rawText.slice(0, 500));

  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error('[API] /register JSON parse failed');
    throw err;
  }
}

export async function logoutUser() {
  console.log('[API] POST /logout');

  const response = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  console.log('[API] /logout status:', response.status);
  console.log('[API] /logout content-type:', response.headers.get('content-type'));

  const rawText = await response.text();

  console.log('[API] /logout raw response:', rawText.slice(0, 500));

  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error('[API] /logout JSON parse failed');
    throw err;
  }
}