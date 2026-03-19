import { apiFetch } from "./client";

const productsCache = new Map();
const categoriesCache = new Map();

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

export async function fetchProducts({ page = 1, perPage = 24, category = "" } = {}) {
  const cacheKey = `${page}:${perPage}:${category}`;

  if (productsCache.has(cacheKey)) {
    return productsCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage)
  });

  if (category) {
    params.set("category", category);
  }

  const response = await apiFetch(`/fyve/v1/products?${params.toString()}`);
  productsCache.set(cacheKey, response);

  return response;
}

export async function fetchCategories() {
  const cacheKey = "all";

  if (categoriesCache.has(cacheKey)) {
    return categoriesCache.get(cacheKey);
  }

  const response = await apiFetch(`/fyve/v1/categories`);
  categoriesCache.set(cacheKey, response);

  return response;
}

export async function fetchProductById(productId) {
  const item = await apiFetch(`/fyve/v1/products/${encodeURIComponent(productId)}`);

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