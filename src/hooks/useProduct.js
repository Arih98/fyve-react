import { useEffect, useState } from "react";
import { fetchProductById } from "../api/products";
import { mapProductForDetail } from "../domain/product/product.mappers";

export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const rawProduct = await fetchProductById(productId);

        if (!active) return;

        const mappedProduct = mapProductForDetail(rawProduct);
        setProduct(mappedProduct);
      } catch (err) {
        if (!active) return;
        setError(err);
        setProduct(null);
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