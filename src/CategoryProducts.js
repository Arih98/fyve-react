// CategoryProducts.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MenuContext } from './MenuContext';
import { startProductImageTransition } from './utils/productImageTransition';
import './pages/ProductsPage.css';

const CategoryProducts = () => {
  const [display, setDisplay] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const imageRefs = useRef(new Map());
  const placeholderImage = 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png';
  const navigate = useNavigate();
  const { isMenuOpen } = useContext(MenuContext);
  const { slug } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories from API
        const catRes = await fetch('/api/manage_categories.php');
        if (!catRes.ok) throw new Error(`HTTP ${catRes.status}`);
        const catData = await catRes.json();
        setCategories(catData);        

        // Load products from localStorage
        const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const normalizedProducts = localProducts.map(product => ({
          ...product,
          variations: product.variations || [],
          gallery: product.gallery || [],
          categories: product.categories || [],
        }));
        setProducts(normalizedProducts);

        setLoading(false);
      } catch (err) {
        console.error('[CategoryProducts] Error loading data:', err.message);
        setError(`Failed to load: ${err.message}`);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (categories.length === 0 || products.length === 0) return;

    // Find the category ID matching the slug (case-insensitive)
    const category = categories.find(cat => cat.name.toLowerCase() === slug.toLowerCase());
    if (!category) {
      setError('Category not found');
      return;
    }

    // Filter products by category ID
    const filteredProducts = products.filter(product => product.categories.includes(category.id));

    // Flatten and deduplicate by product title and color (same as Products.js)
    const seenColorsByTitle = new Map();
    const flattened = filteredProducts.flatMap(product => {
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
  }, [categories, products, slug]);

    const handleProductClick = (item) => {
    const sourceEl = imageRefs.current.get(item.displayId);
    const sourceSrc =
      item.gallery && item.gallery.length > 0
        ? item.gallery[0]
        : placeholderImage;

    const targetProduct = products.find((p) => p.id === item.parentId);
    if (!targetProduct) return;

    const colorQuery = item.selectedColor
      ? `?color=${encodeURIComponent(item.selectedColor)}`
      : '';

    const targetPath = `/product/${item.parentId}${colorQuery}`;

    if (sourceEl) {
      const isMobileViewport = window.innerWidth <= 768;

      startProductImageTransition({
        src: sourceSrc,
        fromElement: sourceEl,
        toElementGetter: () => document.querySelector('[data-pdp-primary-image="true"]'),
        duration: isMobileViewport ? 520 : 620,
        minTargetTop: isMobileViewport ? 80 : 0,
        zIndex: isMobileViewport ? 80 : 999999
      });
    }

    navigate(targetPath, {
      state: {
        product: targetProduct,
        initialColor: item.selectedColor,
        transitionSourceDisplayId: item.displayId,
        transitionSourceSrc: sourceSrc,
        fromProductGrid: true
      }
    });
  };

  const idxLast = currentPage * productsPerPage;
  const idxFirst = idxLast - productsPerPage;
  const currentProducts = display.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(display.length / productsPerPage);

  if (loading) return <div className="products-loading">Loading...</div>;
  if (error) return <div className="products-error">{error}</div>;

  console.log('[CategoryProducts] Rendering', currentProducts.length, 'of', display.length);

  return (
    <div className="products-container">
      <div className={`page-wrapper${isMenuOpen ? ' menu-open' : ''}`}>
        <div className="products-grid">
          {currentProducts.map((item, idx) => (
            <div
              key={`${item.displayId}-${idx}`}
              onClick={(e) => handleProductClick(item, e)}
              className="product-card"
            >
              
<img
  ref={(el) => {
    if (el) {
      imageRefs.current.set(item.displayId, el);
    } else {
      imageRefs.current.delete(item.displayId);
    }
  }}
  id={`img-${item.displayId}`}
  src={
    item.gallery && item.gallery.length > 0
      ? item.gallery[0]
      : '/api/Uploads/fallback-image.png'
  }
  alt={item.title}
  onError={(e) => {
    e.target.src = '/api/Uploads/fallback-image.png';
  }}
  className="product-image"
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
    </div>
  );
};

export default CategoryProducts;