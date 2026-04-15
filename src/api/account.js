const ACCOUNT_API_BASE = `${window.location.origin}/wp-json/fyve-account/v1`

export async function getOrders() {
  const response = await fetch(`${ACCOUNT_API_BASE}/orders`, {
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch orders');
  }

  return data;
}

export async function getAddresses() {
  const response = await fetch(`${ACCOUNT_API_BASE}/addresses`, {
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch addresses');
  }

  return data;
}

export async function updateAddresses(payload) {
  const response = await fetch(`${ACCOUNT_API_BASE}/addresses`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update addresses');
  }

  return data;
}

export async function getAccountDetails() {
  const response = await fetch(`${ACCOUNT_API_BASE}/details`, {
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch account details');
  }

  return data;
}

export async function updateAccountDetails(payload) {
  const response = await fetch(`${ACCOUNT_API_BASE}/details`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update account details');
  }

  return data;
}

export async function getOrderDetail(orderId) {
  const response = await fetch(`${ACCOUNT_API_BASE}/orders/${orderId}`, {
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch order');
  }

  return data.order;
}