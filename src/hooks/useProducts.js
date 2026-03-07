import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products";
import { mapProductForList } from "../domain/product/product.mappers";

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

        const rawItems = response.items || response.products || [];
        const items = rawItems.map(mapProductForList);

        setData(items);
        setMeta({
          page: response.page || page,
          perPage: response.per_page || perPage,
          total: response.total || items.length,
          totalPages: response.total_pages || 1
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