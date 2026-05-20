import React, { useContext, useRef, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useNavigationType } from 'react-router-dom';
import { MenuContext } from '../MenuContext';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';
import { startProductImageTransition } from '../utils/productImageTransition';
import './ProductsPage.css';

const ProductsPage = () => {
  const productsPerPage = 16;
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMenuOpen } = useContext(MenuContext);
  const imageRefs = useRef(new Map());
  const placeholderImage = 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png';
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const clickLockRef = useRef(false);

const selectedCategory = searchParams.get('category') || '';
const [selectedMainFilter, setSelectedMainFilter] = useState('');
const [selectedSubFilter, setSelectedSubFilter] = useState('');
const prevCategoryRef = useRef(selectedCategory);

const { data: products = [], meta: productsMeta, loading, error } = useProducts({
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
  setSelectedMainFilter('');
  setSelectedSubFilter('');
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
  if (prevCategoryRef.current === selectedCategory) return;

  prevCategoryRef.current = selectedCategory;

  const next = new URLSearchParams(searchParams);
  next.set('page', '1');
  setSearchParams(next, { replace: true });
}, [selectedCategory, searchParams, setSearchParams]);

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

const formatCategoryLabel = (slug) => {
  if (!slug) return 'All Products';

  return slug
    .split('-')
    .map(word => word.toLowerCase() === 'ss26' ? 'SS26' : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const activeCategory = useMemo(() => {
  if (!selectedCategory) return null;

  return productsMeta?.pageCategory || {
    name: formatCategoryLabel(selectedCategory),
    slug: selectedCategory
  };
}, [productsMeta?.pageCategory, selectedCategory]);

const pageTitle = activeCategory?.name || 'All Products';

const pageBreadcrumbs = useMemo(() => {
  const items = [
    {
      name: 'Products',
      url: '/products'
    }
  ];

  if (activeCategory) {
    items.push({
      name: activeCategory.name,
      url: `/products?category=${activeCategory.slug}`
    });
  }

  return items;
}, [activeCategory]);

const filterGroups = useMemo(() => {
  return Array.isArray(productsMeta?.filterGroups) ? productsMeta.filterGroups : [];
}, [productsMeta?.filterGroups]);

const selectedMainFilterGroup = useMemo(() => {
  if (!selectedMainFilter) return null;

  return filterGroups.find(group => group.slug === selectedMainFilter) || null;
}, [filterGroups, selectedMainFilter]);

const availableSubFilterCategories = useMemo(() => {
  return Array.isArray(selectedMainFilterGroup?.children)
    ? selectedMainFilterGroup.children
    : [];
}, [selectedMainFilterGroup]);

const filteredDisplay = useMemo(() => {
  return display.filter(product => {
    const categories = Array.isArray(product.categories) ? product.categories : [];

    const matchesMainFilter = selectedMainFilter
      ? categories.some(category => category.slug === selectedMainFilter)
      : true;

    const matchesSubFilter = selectedSubFilter
      ? categories.some(category => category.slug === selectedSubFilter)
      : true;

    return matchesMainFilter && matchesSubFilter;
  });
}, [display, selectedMainFilter, selectedSubFilter]);

const resetProductsPagePosition = () => {
  setVisibleCount(productsPerPage);

  const next = new URLSearchParams(searchParams);
  next.set('page', '1');
  setSearchParams(next, { replace: true });

  window.scrollTo(0, 0);
};

const handleMainFilterChange = (slug) => {
  setSelectedMainFilter(slug);
  setSelectedSubFilter('');
  resetProductsPagePosition();
};

const handleSubFilterChange = (slug) => {
  setSelectedSubFilter(slug);
  resetProductsPagePosition();
};

const productsPageHeader = (
  <div className="products-page-header">
    <nav className="products-page-breadcrumbs" aria-label="Products breadcrumbs">
      {pageBreadcrumbs.map((item, index) => (
        <React.Fragment key={item.url}>
          <Link to={item.url} className="products-page-breadcrumb-link">
            {item.name}
          </Link>

          {index < pageBreadcrumbs.length - 1 && (
            <span className="products-page-breadcrumb-separator">&gt;</span>
          )}
        </React.Fragment>
      ))}
    </nav>

    <h1 className="products-page-title">{pageTitle}</h1>

    {filterGroups.length > 0 && (
      <div className="products-page-filter">
        <button
          type="button"
          className={`products-page-filter-button ${!selectedMainFilter ? 'is-active' : ''}`}
          onClick={() => handleMainFilterChange('')}
        >
          All
        </button>

        {filterGroups.map(group => (
          <button
            key={group.slug}
            type="button"
            className={`products-page-filter-button ${selectedMainFilter === group.slug ? 'is-active' : ''}`}
            onClick={() => handleMainFilterChange(group.slug)}
          >
            {group.name}
          </button>
        ))}
      </div>
    )}

    {selectedMainFilter && availableSubFilterCategories.length > 0 && (
      <div className="products-page-subfilter">
        <button
          type="button"
          className="products-page-selected-filter-button"
          onClick={() => handleMainFilterChange('')}
        >
          <span>{selectedMainFilterGroup?.name || formatCategoryLabel(selectedMainFilter)}</span>
          <span className="products-page-selected-filter-close">×</span>
        </button>

        <button
          type="button"
          className={`products-page-subfilter-button ${!selectedSubFilter ? 'is-active' : ''}`}
          onClick={() => handleSubFilterChange('')}
        >
          All
        </button>

        {availableSubFilterCategories.map(category => (
          <button
            key={category.slug}
            type="button"
            className={`products-page-subfilter-button ${selectedSubFilter === category.slug ? 'is-active' : ''}`}
            onClick={() => handleSubFilterChange(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
    )}
  </div>
);

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
  ? filteredDisplay.slice(0, visibleCount)
  : filteredDisplay.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

const totalPages = isMobile
  ? 1
  : Math.max(1, Math.ceil(filteredDisplay.length / productsPerPage));

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
        {productsPageHeader}

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
  {productsPageHeader}

  <ProductGrid
          products={currentProducts}
          onProductClick={handleProductClick}
          imageRefs={imageRefs}
          placeholderImage={placeholderImage}
        />

        {isMobile && visibleCount < filteredDisplay.length && (
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