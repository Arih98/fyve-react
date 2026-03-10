import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import { MenuContext } from '../MenuContext';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';
import './ProductsPage.css';

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const { data: products, loading, error } = useProducts({
    page: 1,
    perPage: 200
  });
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const { isMenuOpen } = useContext(MenuContext);
  const imageRefs = useRef(new Map());
  const pageRef = useRef(null);
  const gridRef = useRef(null);
  const placeholderImage = 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png';

  const display = products.map((product) => ({
    ...product,
    displayId: product.displayId || product.id,
    parentId: product.parentId || product.id,
    selectedColor: product.selectedColor || null,
    gallery: Array.isArray(product.gallery) && product.gallery.length > 0
      ? product.gallery
      : product.thumbnail
        ? [product.thumbnail, product.hoverImage].filter(Boolean)
        : [],
    title: product.title || product.name,
    image: product.thumbnail,
    rawPrice: product.price,
    price: product.price
  }));

  useEffect(() => {
    const pageEl = pageRef.current;
    const gridEl = gridRef.current;

    const logPageState = (label) => {
      console.log(`[ProductsPage] ${label}`, {
        pathname: location.pathname,
        key: location.key,
        navigationType,
        scrollY: window.scrollY,
        pageRect: pageEl ? pageEl.getBoundingClientRect() : null,
        gridRect: gridEl ? gridEl.getBoundingClientRect() : null,
        gridScrollWidth: gridEl ? gridEl.scrollWidth : null,
        gridScrollHeight: gridEl ? gridEl.scrollHeight : null,
        childCount: gridEl ? gridEl.children.length : null
      });
    };

    logPageState('mounted');

    requestAnimationFrame(() => {
      logPageState('mounted rAF 1');
      requestAnimationFrame(() => {
        logPageState('mounted rAF 2');
      });
    });

    setTimeout(() => logPageState('mounted +100ms'), 100);
    setTimeout(() => logPageState('mounted +300ms'), 300);
    setTimeout(() => logPageState('mounted +600ms'), 600);

    const onPopState = () => {
      console.log('[ProductsPage] window popstate observed', {
        pathname: window.location.pathname,
        scrollY: window.scrollY
      });
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      logPageState('unmounting');
      window.removeEventListener('popstate', onPopState);
    };
  }, [location.key, location.pathname, navigationType]);

  const handleProductClick = (item, e) => {
    console.log('[Products] Product click:', {
      displayId: item.displayId,
      parentId: item.parentId,
      title: item.title,
      selectedColor: item.selectedColor,
      galleryLength: item.gallery?.length || 0,
      isMenuOpen,
      scrollY: window.scrollY
    });

    const wrapperElement = document.getElementById(`img-${item.displayId}`);
    if (wrapperElement) {
      console.log('[Products] Source wrapper details on click:', {
        clientWidth: wrapperElement.clientWidth,
        clientHeight: wrapperElement.clientHeight,
        boundingRect: wrapperElement.getBoundingClientRect(),
        scrollY: window.scrollY
      });
    } else {
      console.warn('[Products] Source wrapper element not found for', item.displayId);
    }

    const targetProduct = products.find((p) => p.id === item.parentId);
    if (!targetProduct) {
      console.error('[Products] Target product not found for parentId:', item.parentId);
      return;
    }

    console.log('[Products] Navigating with product:', {
      id: targetProduct.id,
      title: targetProduct.name,
      initialColor: item.selectedColor,
      transitionKey: item.displayId,
      scrollY: window.scrollY
    });

    const colorQuery = item.selectedColor
      ? `?color=${encodeURIComponent(item.selectedColor)}`
      : '';

    navigate(`/product/${item.parentId}${colorQuery}`, {
      state: {
        product: targetProduct,
        initialColor: item.selectedColor,
        transitionKey: `product-image-${item.displayId}`
      }
    });
  };

  const idxLast = currentPage * productsPerPage;
  const idxFirst = idxLast - productsPerPage;
  const currentProducts = display.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(display.length / productsPerPage);

  if (loading) return <div className="products-loading">Loading...</div>;
  if (error) return <div className="products-error">{error.message || String(error)}</div>;

  console.log('[Products] Rendering', currentProducts.length, 'of', display.length, {
    currentPage,
    scrollY: window.scrollY,
    locationKey: location.key,
    navigationType
  });

  return (
    <div className="products-container" ref={pageRef}>
      <div className={`page-wrapper${isMenuOpen ? ' menu-open' : ''}`}>
        <div ref={gridRef}>
          <ProductGrid
            products={currentProducts}
            onProductClick={handleProductClick}
            imageRefs={imageRefs}
            placeholderImage={placeholderImage}
          />
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

export default ProductsPage;