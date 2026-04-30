import React, { useContext, useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useNavigationType } from 'react-router-dom';
import { MenuContext } from '../MenuContext';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';
import { startProductImageTransition } from '../utils/productImageTransition';
import './ProductsPage.css';

const ProductsPage = () => {
  const productsPerPage = 12;
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMenuOpen } = useContext(MenuContext);
  const imageRefs = useRef(new Map());
  const placeholderImage = 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png';
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
const clickLockRef = useRef(false);

  const selectedCategory = searchParams.get('category') || '';

  const { data: products, loading, error, meta } = useProducts({
    page: 1,
    perPage: 200,
    category: selectedCategory
  });

  const [visibleCount, setVisibleCount] = useState(() => {
    const saved = sessionStorage.getItem(`productsVisibleCount:${selectedCategory || 'all'}`);
    return saved ? Number(saved) : productsPerPage;
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(`productsVisibleCount:${selectedCategory || 'all'}`);
    setVisibleCount(saved ? Number(saved) : productsPerPage);
  }, [selectedCategory]);

  useEffect(() => {
    if (!isMobile) return;
    if (navigationType !== 'POP') return;
    if (loading) return;
    if (!products.length) return;

    const savedY = Number(sessionStorage.getItem(`productsPageScrollY:${selectedCategory || 'all'}`) || 0);
    if (savedY <= 0) return;

    let frame = 0;
    let cancelled = false;
    const maxFrames = 60;

    const tryRestore = () => {
      if (cancelled) return;

      const pageHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const canRestore = pageHeight >= savedY + viewportHeight;

      if (canRestore || frame >= maxFrames) {
        window.scrollTo(0, savedY);
        return;
      }

      frame += 1;
      requestAnimationFrame(tryRestore);
    };

    requestAnimationFrame(tryRestore);

    return () => {
      cancelled = true;
    };
  }, [isMobile, navigationType, loading, products.length, visibleCount, selectedCategory]);

  useEffect(() => {
    sessionStorage.setItem(`productsVisibleCount:${selectedCategory || 'all'}`, String(visibleCount));
  }, [visibleCount, selectedCategory]);

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
selectedStichingColor: product.selectedStichingColor || null,
selectedStitchingColor: product.selectedStitchingColor || product.selectedStichingColor || null,
description: product.description || '',
  short_description: product.short_description || '',
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
  if (clickLockRef.current) return;
  clickLockRef.current = true;
    const sourceEl = imageRefs.current.get(item.displayId);
    const sourceSrc =
      item.gallery && item.gallery.length > 0
        ? item.gallery[0]
        : placeholderImage;

const targetProduct =
  display.find((p) => String(p.parentId) === String(item.parentId)) ||
  products.find((p) => String(p.id) === String(item.parentId));
if (!targetProduct) {
  clickLockRef.current = false;
  return;
}

const selectedProductColor =
  item.selectedColor ||
  item.selectedStitchingColor ||
  item.selectedStichingColor ||
  null;

const colorQuery = selectedProductColor
  ? `?color=${encodeURIComponent(selectedProductColor)}`
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
        zIndex: isMobileViewport ? 1 : 999999
      });
    }

    if (isMobile) {
      sessionStorage.setItem(`productsPageScrollY:${selectedCategory || 'all'}`, String(window.scrollY || 0));
      sessionStorage.setItem(`productsVisibleCount:${selectedCategory || 'all'}`, String(visibleCount));
    }

const navigateToProduct = () => {
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

if (isMobile) {
  window.scrollTo(0, 0);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      navigateToProduct();
    });
  });

  return;
}

navigateToProduct();
  };

  const currentProducts = isMobile
    ? display.slice(0, visibleCount)
    : display.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const totalPages = isMobile
    ? 1
    : Math.max(1, meta?.totalPages || Math.ceil(display.length / productsPerPage));

  const handlePageChange = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className={`page-wrapper${isMenuOpen ? ' menu-open' : ''}`}>

          <div className="products-grid">
            {Array.from({ length: 12 }).map((_, i) => (
<div key={i} className="product-card skeleton-card">
  <div className="product-image-frame skeleton-image-frame">
    <div className="product-image-wrapper skeleton-image"></div>
  </div>
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

        {!isMobile && totalPages > 1 && (
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