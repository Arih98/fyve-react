import { useEffect, useState } from "react";
import { fetchCategories } from "../api/products";

export function useCategories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchCategories();

        if (!active) return;

        const items = Array.isArray(response)
          ? response
          : response.items || [];

        setData(items);
      } catch (err) {
        if (!active) return;
        setError(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  return {
    data,
    loading,
    error
  };
}