const ACCOUNT_API_BASE = 'https://fyvelondon.com/wp-json/fyve-account/v1';

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