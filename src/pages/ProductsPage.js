import React, { useContext, useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  const filterPanelScrollYRef = useRef(0);

const selectedCategory = searchParams.get('category') || '';
const [selectedMainFilter, setSelectedMainFilter] = useState('');
const [selectedSubFilter, setSelectedSubFilter] = useState('');
const [selectedColorFilter, setSelectedColorFilter] = useState('');
const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
const [filterPanelView, setFilterPanelView] = useState('main');
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
  setSelectedColorFilter('');
  setIsFilterPanelOpen(false);
  setFilterPanelView('main');
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

const activeSeasonCategory = useMemo(() => {
  const categoryMap = new Map();

  display.forEach(product => {
    const categories = Array.isArray(product.categories) ? product.categories : [];

    categories.forEach(category => {
      if (!category?.slug || !category?.name) return;

      const rootSlug = String(category.root_slug || '').toLowerCase();
      const parentSlug = String(category.parent_slug || '').toLowerCase();

      if (rootSlug !== 'season' && parentSlug !== 'season') return;

      const current = categoryMap.get(category.slug) || {
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: 0
      };

      current.count += 1;
      categoryMap.set(category.slug, current);
    });
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count)[0] || null;
}, [display]);

const pageBreadcrumbs = useMemo(() => {
  const items = [];

  if (activeSeasonCategory) {
    items.push({
      name: activeSeasonCategory.name,
      url: `/products?category=${activeSeasonCategory.slug}`
    });
  }

  if (activeCategory && activeCategory.slug !== activeSeasonCategory?.slug) {
    items.push({
      name: activeCategory.name,
      url: `/products?category=${activeCategory.slug}`
    });
  }

  return items;
}, [activeCategory, activeSeasonCategory]);

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

const selectedSubFilterCategory = useMemo(() => {
  if (!selectedSubFilter) return null;

  return availableSubFilterCategories.find(category => category.slug === selectedSubFilter) || null;
}, [availableSubFilterCategories, selectedSubFilter]);

const selectedFilterLabel = useMemo(() => {
  if (!selectedMainFilter) return 'Select';

  const mainName = selectedMainFilterGroup?.name || formatCategoryLabel(selectedMainFilter);

  if (!selectedSubFilter) return mainName;

  const subName = selectedSubFilterCategory?.name || formatCategoryLabel(selectedSubFilter);

  return `${mainName}, ${subName}`;
}, [selectedMainFilter, selectedMainFilterGroup, selectedSubFilter, selectedSubFilterCategory]);

const getFilterSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isColorFilterAttribute = (name) => {
  const value = String(name || '').trim().toLowerCase();

  return (
    value === 'color' ||
    value === 'colour' ||
    value.includes('color') ||
    value.includes('colour') ||
    value.includes('stitching') ||
    value.includes('stiching')
  );
};

const getColorFilterClassName = (value) => {
  const slug = getFilterSlug(value);

  if (slug === 'sand') return 'sand';
  if (slug === 'ivory') return 'ivory';
  if (slug === 'mauve') return 'mauve';
  if (slug === 'olive') return 'olive';
  if (slug === 'lavender') return 'lavender';
  if (slug === 'blue') return 'blue';
  if (slug === 'oat') return 'oat';

  return '';
};

const getColorFilterSwatchStyle = (value) => {
  const slug = getFilterSlug(value);

  const colors = {
    sand: '#d2c0ab',
    ivory: '#ebe8de',
    mauve: '#8d686b',
    olive: '#655e39',
    lavender: '#e6e6fa',
    blue: '#afbbd8',
    oat: '#e2d3c6'
  };

  return colors[slug] ? { backgroundColor: colors[slug] } : undefined;
};

const getProductColorFilterOptions = (product) => {
  const colorMap = new Map();

  const addColor = (name, slug) => {
    const colorName = String(name || slug || '').trim();
    const colorSlug = getFilterSlug(slug || name);

    if (!colorName || !colorSlug) return;

    if (!colorMap.has(colorSlug)) {
      colorMap.set(colorSlug, {
        name: colorName,
        slug: colorSlug
      });
    }
  };

  const attributes = Array.isArray(product?.attributes) ? product.attributes : [];

  attributes.forEach(attribute => {
    const attributeName = attribute.attribute_name || attribute.name || '';

    if (!isColorFilterAttribute(attributeName)) return;

    const options = Array.isArray(attribute.options) ? attribute.options : [];

    options.forEach(option => {
      addColor(
        option.term_name || option.name || option.value || option.term_slug,
        option.term_slug || option.slug || option.value || option.term_name
      );
    });
  });

  const variations = Array.isArray(product?.variations) ? product.variations : [];

  variations.forEach(variation => {
    const variationAttributes = Array.isArray(variation.attributes) ? variation.attributes : [];

    variationAttributes.forEach(attribute => {
      const attributeName = attribute.attribute_name || attribute.name || '';

      if (!isColorFilterAttribute(attributeName)) return;

      addColor(
        attribute.term_name || attribute.name || attribute.value || attribute.term_slug,
        attribute.term_slug || attribute.slug || attribute.value || attribute.term_name
      );
    });
  });

  addColor(product?.selectedColor, product?.selectedColor);
  addColor(product?.selectedStitchingColor, product?.selectedStitchingColor);
  addColor(product?.selectedStichingColor, product?.selectedStichingColor);

  return Array.from(colorMap.values());
};

const availableColorFilters = useMemo(() => {
  const colorMap = new Map();

  display.forEach(product => {
    getProductColorFilterOptions(product).forEach(color => {
      if (!colorMap.has(color.slug)) {
        colorMap.set(color.slug, color);
      }
    });
  });

  return Array.from(colorMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}, [display]);

const selectedColorFilterOption = useMemo(() => {
  if (!selectedColorFilter) return null;

  return availableColorFilters.find(color => color.slug === selectedColorFilter) || null;
}, [availableColorFilters, selectedColorFilter]);

const selectedColorFilterLabel = selectedColorFilterOption?.name || 'Select';

const productMatchesColorFilter = (product, colorSlug) => {
  if (!colorSlug) return true;

  return getProductColorFilterOptions(product).some(color => color.slug === colorSlug);
};

const filteredDisplay = useMemo(() => {
  return display.filter(product => {
    const categories = Array.isArray(product.categories) ? product.categories : [];

    const matchesMainFilter = selectedMainFilter
      ? categories.some(category => category.slug === selectedMainFilter)
      : true;

    const matchesSubFilter = selectedSubFilter
      ? categories.some(category => category.slug === selectedSubFilter)
      : true;

    const matchesColorFilter = productMatchesColorFilter(product, selectedColorFilter);

    return matchesMainFilter && matchesSubFilter && matchesColorFilter;
  });
}, [display, selectedMainFilter, selectedSubFilter, selectedColorFilter]);

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

const handleColorFilterChange = (slug) => {
  setSelectedColorFilter(slug);
  resetProductsPagePosition();
};

useEffect(() => {
  const handleOpenProductsFilter = () => {
    setFilterPanelView('main');
    setIsFilterPanelOpen(true);
  };

  window.addEventListener('products:open-filter-panel', handleOpenProductsFilter);

  return () => {
    window.removeEventListener('products:open-filter-panel', handleOpenProductsFilter);
  };
}, []);

useEffect(() => {
  if (!isFilterPanelOpen) return;

  const scrollY = window.scrollY;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  filterPanelScrollYRef.current = scrollY;

  const originalBodyPosition = document.body.style.position;
  const originalBodyTop = document.body.style.top;
  const originalBodyLeft = document.body.style.left;
  const originalBodyRight = document.body.style.right;
  const originalBodyWidth = document.body.style.width;
  const originalBodyOverflow = document.body.style.overflow;
  const originalBodyPaddingRight = document.body.style.paddingRight;

  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    document.body.style.position = originalBodyPosition;
    document.body.style.top = originalBodyTop;
    document.body.style.left = originalBodyLeft;
    document.body.style.right = originalBodyRight;
    document.body.style.width = originalBodyWidth;
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;

    window.scrollTo(0, filterPanelScrollYRef.current);
  };
}, [isFilterPanelOpen]);

const activeFilterCount = [selectedMainFilter, selectedSubFilter, selectedColorFilter].filter(Boolean).length;

const productsPageHeader = (
  <div className="products-page-header">
    <nav className="products-page-breadcrumbs" aria-label="Products breadcrumbs">
      {pageBreadcrumbs.map((item, index) => (
        <React.Fragment key={item.url}>
          <Link to={item.url} className="products-page-breadcrumb-link">
            {item.name}
          </Link>

{index < pageBreadcrumbs.length - 1 && (
  <span className="products-page-breadcrumb-separator" aria-hidden="true">
    <img
      src="/assets/breadcrumbSeparator.svg"
      alt=""
      className="products-page-breadcrumb-separator-icon"
    />
  </span>
)}
        </React.Fragment>
      ))}
    </nav>

    <h1 className="products-page-title">{pageTitle}</h1>
  </div>
);

const closeFilterPanel = () => {
  setIsFilterPanelOpen(false);
  setFilterPanelView('main');
};

const openFilterPanel = () => {
  setFilterPanelView('main');
  setIsFilterPanelOpen(true);
};

const productsPageFilterPanel = (
  <>
    <button
      type="button"
      className="products-filter-sticky-button"
      onClick={openFilterPanel}
    >
      <span>Filter</span>
      {activeFilterCount > 0 && (
        <span className="products-filter-count">{activeFilterCount}</span>
      )}
    </button>

{isFilterPanelOpen && createPortal(
  <div
    className="products-filter-panel-backdrop"
    onClick={closeFilterPanel}
  >
        <aside
          className="products-filter-panel"
          aria-label="Product filters"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="products-filter-panel-header">
            <h2 className="products-filter-panel-title">Filter</h2>

<button
  type="button"
  className="products-filter-panel-close"
  onClick={closeFilterPanel}
  aria-label="Close filter panel"
>
  ×
</button>
          </div>

          <div className="products-filter-panel-body">
  <div className="products-filter-panel-slider">
    <div className={`products-filter-panel-track${filterPanelView === 'category' ? ' is-category-view' : ''}${filterPanelView === 'color' ? ' is-color-view' : ''}`}>
      <div className="products-filter-panel-screen">
  <button
    type="button"
    className="products-filter-drill-row"
    onClick={() => setFilterPanelView('category')}
  >
    <span className="products-filter-drill-label">Category</span>

    <span className="products-filter-drill-meta">
      <span className="products-filter-drill-value">{selectedFilterLabel}</span>
      <img
        src="/assets/breadcrumbSeparator.svg"
        alt=""
        className="products-filter-drill-chevron"
      />
    </span>
  </button>

  {availableColorFilters.length > 0 && (
    <button
      type="button"
      className="products-filter-drill-row"
      onClick={() => setFilterPanelView('color')}
    >
      <span className="products-filter-drill-label">Color</span>

      <span className="products-filter-drill-meta">
        <span className="products-filter-drill-value">{selectedColorFilterLabel}</span>
        <img
          src="/assets/breadcrumbSeparator.svg"
          alt=""
          className="products-filter-drill-chevron"
        />
      </span>
    </button>
  )}
</div>

      <div className="products-filter-panel-screen">
        <button
          type="button"
          className="products-filter-back-row"
          onClick={() => setFilterPanelView('main')}
        >
          <img
            src="/assets/breadcrumbSeparator.svg"
            alt=""
            className="products-filter-back-chevron"
          />
          <span>Category</span>
        </button>

        <div className="products-filter-checkbox-list">

          {filterGroups.map(group => {
            const isSelectedMain = selectedMainFilter === group.slug;
            const children = Array.isArray(group.children) ? group.children : [];

            return (
              <div key={group.slug} className="products-filter-checkbox-group">
                <button
                  type="button"
                  className="products-filter-checkbox-row"
                  role="checkbox"
                  aria-checked={isSelectedMain}
                  onClick={() => handleMainFilterChange(isSelectedMain ? '' : group.slug)}
                >
                  <span className={`products-filter-checkbox ${isSelectedMain ? 'is-checked' : ''}`}></span>
                  <span className="products-filter-checkbox-label">{group.name}</span>
                </button>

                {isSelectedMain && children.length > 0 && (
                  <div className="products-filter-child-checkbox-list">

                    {children.map(category => {
                      const isSelectedSub = selectedSubFilter === category.slug;

                      return (
                        <button
                          key={category.slug}
                          type="button"
                          className="products-filter-checkbox-row products-filter-child-checkbox-row"
                          role="checkbox"
                          aria-checked={isSelectedSub}
                          onClick={() => handleSubFilterChange(isSelectedSub ? '' : category.slug)}
                        >
                          <span className={`products-filter-checkbox ${isSelectedSub ? 'is-checked' : ''}`}></span>
                          <span className="products-filter-checkbox-label">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    <div className="products-filter-panel-screen">
  <button
    type="button"
    className="products-filter-back-row"
    onClick={() => setFilterPanelView('main')}
  >
    <img
      src="/assets/breadcrumbSeparator.svg"
      alt=""
      className="products-filter-back-chevron"
    />
    <span>Color</span>
  </button>

  <div className="products-filter-checkbox-list">
    {availableColorFilters.map(color => {
      const isSelectedColor = selectedColorFilter === color.slug;

      return (
        <button
          key={color.slug}
          type="button"
          className="products-filter-checkbox-row products-filter-color-row"
          role="checkbox"
          aria-checked={isSelectedColor}
          onClick={() => handleColorFilterChange(isSelectedColor ? '' : color.slug)}
        >
          <span className={`products-filter-checkbox ${isSelectedColor ? 'is-checked' : ''}`}></span>
          <span
            className={`products-filter-color-dot ${getColorFilterClassName(color.slug)}`}
            style={getColorFilterSwatchStyle(color.slug)}
          ></span>
          <span className="products-filter-checkbox-label">{color.name}</span>
        </button>
      );
    })}
  </div>
</div>
    </div>
  </div>
</div>

          <div className="products-filter-panel-footer">
  <button
    type="button"
    className="products-filter-clear-button"
onClick={() => {
  setSelectedMainFilter('');
  setSelectedSubFilter('');
  setSelectedColorFilter('');
  setFilterPanelView('main');
  resetProductsPagePosition();
}}
  >
    Clear
  </button>

  <button
    type="button"
    className="products-filter-apply-button"
    onClick={closeFilterPanel}
  >
    Show products
  </button>
</div>
        </aside>
  </div>,
  document.body
)}
  </>
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
        {productsPageFilterPanel}
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

{productsPageFilterPanel}

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