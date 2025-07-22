import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuContext } from './MenuContext';
import { motion } from 'framer-motion';
import './Products.css';

const Products = () => {
  const [display, setDisplay] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const navigate = useNavigate();
  const { isMenuOpen } = useContext(MenuContext);
  const imageRefs = useRef(new Map());

  useEffect(() => {
    console.log('[Products] Component mounted');
    return () => console.log('[Products] Component unmounted');
  }, []);

  useEffect(() => {
    try {
      console.log('[Products] Loading products from localStorage');
      const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const normalizedProducts = localProducts.map(product => ({
        ...product,
        variations: product.variations || [],
        gallery: product.gallery || [],
      }));
      console.log('[Products] Loaded', normalizedProducts.length, 'products');
      setProducts(normalizedProducts);

      // Flatten and deduplicate by product title and color
      const seenColorsByTitle = new Map();
      const flattened = normalizedProducts.flatMap(product => {
        if (product.product_type !== 'variable') return [{...product, displayId: product.id, gallery: product.gallery}];
        let colorVariants = product.variations.reduce((acc, variation) => {
          const colorAttr = variation.attributes?.find(a => a.attribute_name === 'Color')?.term_name;
          if (colorAttr && !colorAttr.startsWith('Any')) {
            const key = `${product.title}-${colorAttr}`;
            if (!seenColorsByTitle.has(key)) {
              seenColorsByTitle.set(key, true);
              acc.push({
                displayId: `${product.id}-${colorAttr}`,
                parentId: product.id,
                title: variation.title || `${product.title} - ${colorAttr}`,
                price: variation.price || product.price,
                selectedColor: colorAttr,
                sku: variation.sku,
                gallery: variation.gallery,
              });
            }
          }
          return acc;
        }, []);
        if (colorVariants.length === 0) {
          const defaultVariation = product.variations[0] || {};
          const defaultGallery = defaultVariation.gallery || product.gallery || [];
          const defaultTitle = product.title;
          const defaultPrice = defaultVariation.price || product.price;
          const defaultSku = defaultVariation.sku || product.sku;
          colorVariants.push({
            displayId: `${product.id}-default`,
            parentId: product.id,
            title: defaultTitle,
            price: defaultPrice,
            selectedColor: null,
            sku: defaultSku,
            gallery: defaultGallery,
          });
        }
        return colorVariants;
      });
      setDisplay(flattened);
      setLoading(false);
    } catch (err) {
      console.error('[Products] Error loading products:', err.message);
      setError(`Failed to load: ${err.message}`);
      setLoading(false);
    }
  }, []);

  const handleProductClick = (item, e) => {
    console.log('[Products] Product click:', {
      displayId: item.displayId,
      parentId: item.parentId,
      title: item.title,
      selectedColor: item.selectedColor,
      galleryLength: item.gallery?.length || 0,
      isMenuOpen,
    });
    const imgElement = document.getElementById(`img-${item.displayId}`);
    if (imgElement) {
      console.log('[Products] Source image details on click:', {
        src: imgElement.src,
        clientWidth: imgElement.clientWidth,
        clientHeight: imgElement.clientHeight,
        naturalWidth: imgElement.naturalWidth,
        naturalHeight: imgElement.naturalHeight,
        boundingRect: imgElement.getBoundingClientRect(),
        complete: imgElement.complete,
      });
    } else {
      console.warn('[Products] Source image element not found for', item.displayId);
    }
    const targetProduct = products.find(p => p.id === item.parentId);
    console.log('[Products] Navigating with product:', {
      id: targetProduct?.id,
      title: targetProduct?.title,
      productType: targetProduct?.product_type,
      variationsLength: targetProduct?.variations?.length || 0,
      galleryLength: targetProduct?.gallery?.length || 0,
      initialColor: item.selectedColor,
      transitionKey: item.displayId,
    });
    navigate(`/product/${item.parentId}`, { 
      state: { 
        product: targetProduct, 
        initialColor: item.selectedColor, 
        transitionKey: `main-${item.displayId}-${Date.now()}` 
      } 
    });
  };

  const idxLast = currentPage * productsPerPage;
  const idxFirst = idxLast - productsPerPage;
  const currentProducts = display.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(display.length / productsPerPage);

  if (loading) return <div className="products-loading">Loading...</div>;
  if (error) return <div className="products-error">{error}</div>;

  console.log('[Products] Rendering', currentProducts.length, 'of', display.length);

  return (
    <div className="products-container">
      <div className="products-grid">
        {currentProducts.map((item, idx) => (
          <div
            key={`${item.displayId}-${idx}`}
            onClick={(e) => handleProductClick(item, e)}
            className="product-card"
          >
            <motion.img
              initial={false}
              layoutId={`product-image-${item.displayId}`}
              ref={el => imageRefs.current.set(item.displayId, el)}
              id={`img-${item.displayId}`}
              src={
                item.gallery && item.gallery.length > 0
                  ? item.gallery[0]
                  : '/api/Uploads/fallback-image.png'
              }
              alt={item.title}
              onError={e => { e.target.src = '/api/Uploads/fallback-image.png'; }}
              onLoad={e => console.log('[Products] Image loaded for', item.displayId, {
                src: e.target.src,
                naturalWidth: e.target.naturalWidth,
                naturalHeight: e.target.naturalHeight,
              })}
              className="product-image"
              onAnimationStart={() => console.log('[Products] Animation start for image', item.displayId)}
              onAnimationComplete={() => console.log('[Products] Animation complete for image', item.displayId)}
              onLayoutAnimationStart={() => {
                const el = imageRefs.current.get(item.displayId);
                if (el) {
                  const currentZ = window.getComputedStyle(el).zIndex;
                  console.log('[Products] Layout animation start for', item.displayId, '- current z-index:', currentZ);
                  el.style.zIndex = '10000';
                  console.log('[Products] Set high z-index to 10000 for', item.displayId, '- new z-index:', window.getComputedStyle(el).zIndex);
                }
              }}
              onLayoutAnimationComplete={() => {
                const el = imageRefs.current.get(item.displayId);
                if (el) {
                  const currentZ = window.getComputedStyle(el).zIndex;
                  console.log('[Products] Layout animation complete for', item.displayId, '- current z-index:', currentZ);
                  el.style.zIndex = '';
                  console.log('[Products] Reset z-index for', item.displayId, '- new z-index:', window.getComputedStyle(el).zIndex);
                }
              }}
            />
            <div className="product-info">
              <h3 className="product-title">
                {item.title}
              </h3>
              <p className="product-price">
                ${item.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`pagination-button ${currentPage === i + 1 ? 'pagination-button-active' : 'pagination-button-inactive'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Products;