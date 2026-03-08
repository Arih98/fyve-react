import { useMemo } from "react";

export function useRelatedProducts(product, currentVariation, allProducts, isColorAttribute) {
  return useMemo(() => {
    if (!product) return [];

    const relatedProductsRaw =
      product.product_type === "variable"
        ? currentVariation?.related_products || []
        : product.related_products || [];

    return relatedProductsRaw
      .map(rel => {
        const normalizedRel = typeof rel === "string" ? { productId: rel } : rel;

        const p = allProducts.find(p => String(p.id) === String(normalizedRel.productId));
        if (!p) return null;

        const color = normalizedRel.selectedColor;

        if (color) {
          const v = (Array.isArray(p.variations) ? p.variations : []).find(v =>
            Array.isArray(v.attributes) &&
            v.attributes.some(a =>
              isColorAttribute(a.attribute_name) &&
              String(a.term_name || "").trim().toLowerCase() === String(color || "").trim().toLowerCase()
            )
          );

          return {
            ...p,
            displayId: `${p.id}-${color}`,
            selectedColor: color,
            displayTitle: v?.title || `${p.title} - ${color}`,
            displayPrice: v?.price || p.price,
            displayGallery: v?.gallery || p.gallery
          };
        }

        return {
          ...p,
          displayId: p.id,
          selectedColor: null,
          displayTitle: p.title,
          displayPrice: p.price,
          displayGallery: p.gallery
        };
      })
      .filter(Boolean);
  }, [product, currentVariation, allProducts, isColorAttribute]);
}