import { apiFetch } from "./client";

export function fetchProducts({ page = 1, perPage = 24 } = {}) {
  return apiFetch(`/fyve/v1/products?page=${page}&per_page=${perPage}`);
}

export function fetchProductBySlug(slug) {
  return apiFetch(`/fyve/v1/products?slug=${encodeURIComponent(slug)}`);
}