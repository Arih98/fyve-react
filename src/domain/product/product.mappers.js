function normalizePrice(raw) {
  if (raw?.price !== undefined && raw?.price !== null && raw?.price !== "") {
    const simplePrice = Number(raw.price) || 0;
    const regular = raw?.regular_price ? Number(raw.regular_price) || simplePrice : simplePrice;
    const sale = raw?.sale_price ? Number(raw.sale_price) || null : null;
    const current = sale && sale < regular ? sale : simplePrice;

    return {
      regular,
      sale,
      current,
      currency: "USD",
      isOnSale: !!sale && sale < regular
    };
  }

  const regular = Number(raw?.regular_price || 0);
  const sale = raw?.sale_price ? Number(raw.sale_price) : null;
  const current = sale || regular;

  return {
    regular,
    sale,
    current,
    currency: "USD",
    isOnSale: !!sale && sale < regular
  };
}

function getVariationColor(variation) {
  const attrs = Array.isArray(variation?.attributes) ? variation.attributes : [];

  const colorAttr = attrs.find((attr) => {
    const name = String(attr.attribute_name || attr.name || "").toLowerCase();
    const slug = String(attr.slug || "").toLowerCase();
    return name === "color" || slug === "pa_color" || slug === "color";
  });

  return colorAttr?.term_name || colorAttr?.option || null;
}

function getVariationAttributeValue(variation, names = []) {
  const attrs = Array.isArray(variation?.attributes) ? variation.attributes : [];
  const normalizedNames = names.map(name => String(name || "").trim().toLowerCase());

  const match = attrs.find((attr) => {
    const label = String(attr.attribute_name || attr.name || "").trim().toLowerCase();
    const slug = String(attr.slug || attr.attribute_slug || "").trim().toLowerCase();

    return normalizedNames.includes(label) || normalizedNames.includes(slug);
  });

  return match?.term_name || match?.option || match?.term_slug || null;
}

function getVariationImageGallery(variation, product) {
  const variationGallery = Array.isArray(variation?.gallery) ? variation.gallery : [];
  const productGallery = Array.isArray(product?.gallery) ? product.gallery : [];

  if (variationGallery.length > 0) {
    const firstImage = variationGallery[0] || "";
    const hoverImage =
      variationGallery[2] ||
      variationGallery[1] ||
      variationGallery[0] ||
      "";

    return [firstImage, hoverImage].filter(Boolean);
  }

  if (productGallery.length > 0) {
    const firstImage = productGallery[0] || "";
    const hoverImage =
      productGallery[2] ||
      productGallery[1] ||
      productGallery[0] ||
      "";

    return [firstImage, hoverImage].filter(Boolean);
  }

  return [];
}

function mapBaseProduct(raw) {
  const gallery = Array.isArray(raw.gallery) ? raw.gallery : [];
  const images = Array.isArray(raw.images) ? raw.images : [];
  const variations = Array.isArray(raw.variations) ? raw.variations : [];
  const price = normalizePrice(raw);

  const thumbnail =
    gallery[0] ||
    images[0]?.src ||
    images[0] ||
    "";

  const hoverImage =
    gallery[1] ||
    gallery[0] ||
    images[1]?.src ||
    images[1] ||
    images[0]?.src ||
    images[0] ||
    thumbnail;

return {
  id: raw.id,
  parentId: raw.id,
  slug: raw.slug || "",
  name: raw.name || raw.title || "",
  title: raw.title || raw.name || "",
  subtitle: raw.short_description || "",
  description: raw.description || "",
  short_description: raw.short_description || "",
  shortDescription: raw.short_description || "",
  categories: Array.isArray(raw.categories) ? raw.categories : [],
  price,
    thumbnail,
    hoverImage,
    gallery: gallery.length > 0 ? gallery : [thumbnail, hoverImage].filter(Boolean),
    badges: price.isOnSale ? ["Sale"] : [],
    stockStatus: raw.stock_status || "out_of_stock",
    product_type: raw.product_type,
    variations,
    size_chart: raw.size_chart || null,
    selectedColor: null,
    variationId: null
  };
}

export function mapProductForList(raw) {
  return mapBaseProduct(raw);
}

export function mapProductsForList(rawProducts = []) {
  const output = [];

  rawProducts.forEach((raw) => {
    const base = mapBaseProduct(raw);

    if (raw?.product_type !== "variable" || !Array.isArray(raw?.variations) || raw.variations.length === 0) {
      output.push(base);
      return;
    }

    const seenCombinations = new Set();

    raw.variations.forEach((variation) => {
      const color = getVariationColor(variation);
      const stichingColor = getVariationAttributeValue(variation, [
        "stiching color",
        "stiching-color",
        "pa_stiching-color",
        "stitching color",
        "stitching-color",
        "pa_stitching-color"
      ]);

      const colorKey = color ? color.trim().toLowerCase() : "default-color";
      const stichingKey = stichingColor ? stichingColor.trim().toLowerCase() : "default-stiching";
      const combinationKey = `${colorKey}-${stichingKey}`;

      if (seenCombinations.has(combinationKey)) return;
      seenCombinations.add(combinationKey);

      const variationPrice = normalizePrice(variation);
      const variationGallery = getVariationImageGallery(variation, raw);

      output.push({
        ...base,
        displayId: `${raw.id}-${combinationKey}`,
        variationId: variation.id,
        selectedColor: color || null,
        selectedStichingColor: stichingColor || null,
        selectedStitchingColor: stichingColor || null,
        title: variation.title || raw.title || raw.name || "",
        name: variation.title || raw.title || raw.name || "",
        price: variationPrice,
        thumbnail: variationGallery[0] || base.thumbnail,
        hoverImage: variationGallery[1] || variationGallery[0] || base.hoverImage,
        gallery: variationGallery.length > 0 ? variationGallery : base.gallery
      });
    });

    if (!seenCombinations.size) {
      const firstVariation = Array.isArray(raw.variations) && raw.variations.length > 0
        ? raw.variations[0]
        : null;

      if (firstVariation) {
        const variationPrice = normalizePrice(firstVariation);
        const variationGallery = getVariationImageGallery(firstVariation, raw);
        const color = getVariationColor(firstVariation);
        const stichingColor = getVariationAttributeValue(firstVariation, [
          "stiching color",
          "stiching-color",
          "pa_stiching-color",
          "stitching color",
          "stitching-color",
          "pa_stitching-color"
        ]);

        output.push({
          ...base,
          displayId: `${raw.id}-default`,
          variationId: firstVariation.id,
          selectedColor: color || null,
          selectedStichingColor: stichingColor || null,
          selectedStitchingColor: stichingColor || null,
          title: firstVariation.title || raw.title || raw.name || "",
          name: firstVariation.title || raw.title || raw.name || "",
          price: variationPrice,
          thumbnail: variationGallery[0] || base.thumbnail,
          hoverImage: variationGallery[1] || variationGallery[0] || base.hoverImage,
          gallery: variationGallery.length > 0 ? variationGallery : base.gallery
        });
      } else {
        output.push({
          ...base,
          displayId: `${raw.id}-default`
        });
      }
    }
  });

  return output;
}

export function mapProductForDetail(raw) {
  const base = mapBaseProduct(raw);

  return {
    ...base,
    description: raw.description || "",
    shortDescription: raw.short_description || "",
    sku: raw.sku || "",
    stockQuantity: raw.stock_quantity ?? null,
    stockStatus: raw.stock_status || "out_of_stock",
    attributes: Array.isArray(raw.attributes) ? raw.attributes : [],
    variations: Array.isArray(raw.variations) ? raw.variations : [],
    size_chart: raw.size_chart || null
  };
}