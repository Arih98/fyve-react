import { useEffect, useState } from "react";

export function useStoredProducts() {
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const localProducts = JSON.parse(localStorage.getItem("products") || "[]");
    setAllProducts(localProducts);
  }, []);

  return allProducts;
}