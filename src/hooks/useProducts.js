import { useEffect, useState } from "react";
import { fetchProductById, fetchProducts } from "../api/products";

export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        let matched = null;

        try {
          const singleResponse = await fetchProductById(productId);

          if (!active) return;

          if (Array.isArray(singleResponse)) {
            matched = singleResponse.find((item) => String(item.id) === String(productId)) || null;
          } else if (singleResponse?.id && String(singleResponse.id) === String(productId)) {
            matched = singleResponse;
          } else if (singleResponse?.item?.id && String(singleResponse.item.id) === String(productId)) {
            matched = singleResponse.item;
          } else if (singleResponse?.product?.id && String(singleResponse.product.id) === String(productId)) {
            matched = singleResponse.product;
          }
        } catch (singleErr) {
        }

        if (!matched) {
          const response = await fetchProducts({ page: 1, perPage: 500 });

          if (!active) return;

          const rawItems = Array.isArray(response)
            ? response
            : response.items || response.products || [];

          matched = rawItems.find((item) => String(item.id) === String(productId)) || null;
        }

        if (!matched) {
          throw new Error(`Product ${productId} not found`);
        }

        setProduct(matched);
      } catch (err) {
        if (!active) return;
        setError(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  return {
    product,
    loading,
    error
  };
}