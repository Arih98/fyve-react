import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products";
import { mapProductsForList } from "../domain/product/product.mappers";

export function useProducts({ page = 1, perPage = 24 } = {}) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page,
    perPage,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchProducts({ page, perPage });

        if (!active) return;

        const rawItems = Array.isArray(response)
          ? response
          : response.items || response.products || [];
          
          if (rawItems[0]?.variations?.[0]) {
  console.log('[useProducts] FIRST PRODUCT', rawItems[0]);
  console.log('[useProducts] FIRST VARIATION', rawItems[0].variations[0]);
}

        const items = mapProductsForList(rawItems);

        setData(items);
        setMeta({
          page: Array.isArray(response) ? page : response.page || page,
          perPage: Array.isArray(response) ? perPage : response.per_page || perPage,
          total: Array.isArray(response) ? items.length : response.total || items.length,
          totalPages: Array.isArray(response)
            ? Math.max(1, Math.ceil(items.length / perPage))
            : response.total_pages || 1
        });
      } catch (err) {
        if (!active) return;
        setError(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [page, perPage]);

  return {
    data,
    meta,
    loading,
    error
  };
}