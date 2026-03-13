import React, { useContext, useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MenuContext } from '../MenuContext';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';
import { startProductImageTransition } from '../utils/productImageTransition';
import './ProductsPage.css';

const ProductsPage = () => {
  const productsPerPage = 12;
  const { data: products, loading, error } = useProducts({
    page: 1,
    perPage: 200
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMenuOpen } = useContext(MenuContext);
  const imageRefs = useRef(new Map());
  const placeholderImage = 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png';
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [visibleCount, setVisibleCount] = useState(() => {
    const saved = sessionStorage.getItem('productsVisibleCount');
    return saved ? Number(saved) : productsPerPage;
  });

  useEffect(() => {
  if (!isMobile) return;

  const saveScroll = () => {
    sessionStorage.setItem('productsPageScrollY', String(window.scrollY || 0));
  };

  window.addEventListener('scroll', saveScroll, { passive: true });

  return () => {
    saveScroll();
    window.removeEventListener('scroll', saveScroll);
  };
}, [isMobile]);

useEffect(() => {
  if (!isMobile) return;
  if (loading) return;
  if (!products.length) return;

  const savedY = Number(sessionStorage.getItem('productsPageScrollY') || 0);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, savedY);
    });
  });
}, [isMobile, loading, products.length, visibleCount]);

  useEffect(() => {
    sessionStorage.setItem('productsVisibleCount', String(visibleCount));
  }, [visibleCount]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentPage = Math.max(1, Number(searchParams.get('page') || 1));

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

  const currentProducts = isMobile
    ? display.slice(0, visibleCount)
    : display.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const totalPages = Math.ceil(display.length / productsPerPage);

  const handlePageChange = (page) => {
    setSearchParams({ page: String(page) });
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className={`page-wrapper${isMenuOpen ? ' menu-open' : ''}`}>
          <div className="products-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="product-image-wrapper skeleton-image"></div>
                <div className="product-info">
                  <div className="skeleton-text skeleton-title"></div>
                  <div className="skeleton-text skeleton-price"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="products-error">{error.message || String(error)}</div>;

  return (
    <div className="products-container">
      <div className={`page-wrapper${isMenuOpen ? ' menu-open' : ''}`}>
        <ProductGrid
          products={currentProducts}
          onProductClick={handleProductClick}
          imageRefs={imageRefs}
          placeholderImage={placeholderImage}
        />

        {isMobile && visibleCount < display.length && (
          <div className="show-more-wrapper">
            <button
              className="show-more-button"
              onClick={() => setVisibleCount(v => v + productsPerPage)}
            >
              Show more
            </button>
          </div>
        )}

        {!isMobile && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-button ${currentPage === page ? 'pagination-button-active' : 'pagination-button-inactive'}`}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;