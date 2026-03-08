import { useEffect, useState } from 'react';
import { fetchInventoryBySku } from '../api/inventory';

export function useInventory(sku) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sku) {
      setStock(null);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    async function loadInventory() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchInventoryBySku(sku);

        if (!active) return;

        setStock(data.stock_quantity ?? 0);
      } catch (err) {
        if (!active) return;
        setError(err);
        setStock(0);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      active = false;
    };
  }, [sku]);

  return {
    stock,
    loading,
    error
  };
}