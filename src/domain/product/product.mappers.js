function normalizePrice(raw) {
  if (raw?.price !== undefined && raw?.price !== null && raw?.price !== "") {
    const simplePrice = Number(raw.price) || 0;

    return {
      regular: simplePrice,
      sale: null,
      current: simplePrice,
      currency: "USD",
      isOnSale: false
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

function normalizeImage(image) {
  if (!image) {
    return {
      id: null,
      src: "",
      alt: ""
    };
  }

  if (typeof image === "string") {
    return {
      id: null,
      src: image,
      alt: ""
    };
  }

  return {
    id: image.id || null,
    src: image.src || "",
    alt: image.alt || ""
  };
}

function getColorOptionFromAttributes(attributes = []) {
  const colorAttr = attributes.find((attr) => {
    const name = String(attr.name || "").toLowerCase();
    const slug = String(attr.slug || "").toLowerCase();
    return name === "color" || slug === "pa_color" || slug === "color";
  });

  if (!colorAttr?.option) return null;

  return {
    name: colorAttr.option,
    slug: String(colorAttr.option).toLowerCase().replace(/\s+/g, "-")
  };
}

function extractColorOptions(variations = []) {
  const seen = new Map();

  variations.forEach((variation) => {
    const color = getColorOptionFromAttributes(variation.attributes || []);
    if (color && !seen.has(color.slug)) {
      seen.set(color.slug, color);
    }
  });

  return Array.from(seen.values());
}

function normalizeVariant(variant) {
  const attributes = (variant.attributes || []).reduce((acc, attr) => {
    const key = String(attr.slug || attr.name || "")
      .toLowerCase()
      .replace(/^pa_/, "");
    acc[key] = attr.option || "";
    return acc;
  }, {});

  return {
    id: variant.id,
    sku: variant.sku || "",
    price: normalizePrice(variant),
    stockStatus: variant.stock_status || "out_of_stock",
    attributes,
    image: normalizeImage(variant.image)
  };
}

export function mapProductForList(raw) {
  const images = Array.isArray(raw.images) ? raw.images : [];
  const gallery = Array.isArray(raw.gallery) ? raw.gallery : [];
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
    slug: raw.slug || "",
    name: raw.name || raw.title || "",
    subtitle: raw.short_description || "",
    price,
    thumbnail,
    hoverImage,
    badges: price.isOnSale ? ["Sale"] : [],
    stockStatus: raw.stock_status || "out_of_stock",
    colorOptions: extractColorOptions(variations),
    defaultVariantId: variations[0]?.id || null
  };
}

export function mapProductForDetail(raw) {
  const variants = (raw.variations || []).map(normalizeVariant);
  const images = Array.isArray(raw.images) ? raw.images : [];
  const gallery = Array.isArray(raw.gallery) ? raw.gallery : [];

  return {
    id: raw.id,
    slug: raw.slug || "",
    name: raw.name || raw.title || "",
    description: raw.description || "",
    shortDescription: raw.short_description || "",
    price: normalizePrice(raw),
    stockStatus: raw.stock_status || "out_of_stock",
    images: gallery.length > 0 ? gallery.map(normalizeImage) : images.map(normalizeImage),
    attributes: raw.attributes || [],
    variants,
    defaultVariantId: variants[0]?.id || null
  };
}