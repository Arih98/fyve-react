import { useEffect, useState } from "react";
import { fetchProductById } from "../api/products";
import { mapProductForDetail } from "../domain/product/product.mappers";

const productCache = new Map();
const productRequests = new Map();

const getKey = (productId) => String(productId || "");

async function fetchProductOnce(productId) {
  const key = getKey(productId);

  if (productCache.has(key)) {
    return productCache.get(key);
  }

  if (productRequests.has(key)) {
    return productRequests.get(key);
  }

  const request = fetchProductById(productId)
    .then((rawProduct) => {
      const mappedProduct = mapProductForDetail(rawProduct);
      productCache.set(key, mappedProduct);
      return mappedProduct;
    })
    .finally(() => {
      productRequests.delete(key);
    });

  productRequests.set(key, request);
  return request;
}

export function useProduct(productId, initialProduct = null) {
  const key = getKey(productId);

  const [product, setProduct] = useState(() => {
    if (key && productCache.has(key)) {
      return productCache.get(key);
    }

    return initialProduct;
  });

  const [loading, setLoading] = useState(() => {
    return Boolean(key) && !productCache.has(key);
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!key) {
      setProduct(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    if (initialProduct) {
      setProduct(initialProduct);
    }

    if (productCache.has(key)) {
      setProduct(productCache.get(key));
      setLoading(false);
      setError(null);
      return;
    }

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const mappedProduct = await fetchProductOnce(productId);

        if (!active) return;

        setProduct(mappedProduct);
      } catch (err) {
        if (!active) return;

        setError(err);

        if (!initialProduct) {
          setProduct(null);
        }
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
  }, [key, productId, initialProduct]);

  return {
    product,
    loading,
    error
  };
}