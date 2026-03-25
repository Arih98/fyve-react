import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useRelatedProductNavigation(allProducts) {
  const navigate = useNavigate();

  return useCallback((relItem) => {
    const originalProduct = allProducts.find((p) => String(p.id) === String(relItem.id));

    const colorQuery = relItem.selectedColor
      ? `?color=${encodeURIComponent(relItem.selectedColor)}`
      : '';

    navigate(`/product/${relItem.id}${colorQuery}`, {
      state: {
        product: originalProduct,
        initialColor: relItem.selectedColor,
        fromProductGrid: false
      }
    });
  }, [allProducts, navigate]);
}