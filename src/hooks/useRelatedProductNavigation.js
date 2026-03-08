import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useRelatedProductNavigation(allProducts) {
  const navigate = useNavigate();

  return useCallback((relItem) => {
    const originalProduct = allProducts.find(p => String(p.id) === String(relItem.id));

    navigate(`/product/${relItem.id}`, {
      state: {
        product: originalProduct,
        initialColor: relItem.selectedColor,
        transitionKey: `product-image-${relItem.displayId}`
      }
    });
  }, [allProducts, navigate]);
}