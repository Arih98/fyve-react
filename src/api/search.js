const getApiOrigin = () => {
  if (process.env.REACT_APP_WP_API_ORIGIN) {
    return process.env.REACT_APP_WP_API_ORIGIN.replace(/\/$/, '');
  }

  if (window.location.hostname === 'dev.fyvelondon.com') {
    return 'https://fyvelondon.com';
  }

  return '';
};

export async function searchProducts(query, options = {}) {
  const q = String(query || '').trim();

  if (q.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q,
    per_page: String(options.limit || 8)
  });

  const response = await fetch(`${getApiOrigin()}/wp-json/fyve/v1/search?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    signal: options.signal
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  const data = await response.json();

  return Array.isArray(data?.products) ? data.products : [];
}