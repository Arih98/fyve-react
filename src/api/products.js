import { apiFetch } from "./client";

function extractItems(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.products)) return response.products;
  return [];
}

function extractSingleItem(response) {
  if (!response) return null;
  if (response?.item && typeof response.item === "object") return response.item;
  if (response?.product && typeof response.product === "object") return response.product;
  if (response?.id) return response;

  const items = extractItems(response);
  return items[0] || null;
}

export async function fetchProducts({ page = 1, perPage = 24 } = {}) {
  return apiFetch(`/fyve/v1/products?page=${page}&per_page=${perPage}`);
}

export async function fetchProductById(productId) {
  const response = await apiFetch(`/fyve/v1/products?id=${encodeURIComponent(productId)}`);
  const item = extractSingleItem(response);

  if (!item || String(item.id) !== String(productId)) {
    throw new Error(`Product ${productId} not found`);
  }

  return item;
}

export async function fetchProductBySlug(slug) {
  const response = await apiFetch(`/fyve/v1/products?slug=${encodeURIComponent(slug)}`);
  const item = extractSingleItem(response);

  if (!item) {
    throw new Error(`Product with slug "${slug}" not found`);
  }

  return item;
}