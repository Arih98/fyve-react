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
const [selectedMainFilters, setSelectedMainFilters] = useState([]);
const [selectedSubFilters, setSelectedSubFilters] = useState([]);
const [selectedColorFilters, setSelectedColorFilters] = useState([]);
const [selectedSizeFilters, setSelectedSizeFilters] = useState([]);
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
  setSelectedMainFilters([]);
  setSelectedSubFilters([]);
  setSelectedColorFilters([]);
  setSelectedSizeFilters([]);
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

const selectedMainFilterGroups = useMemo(() => {
  return selectedMainFilters
    .map(slug => filterGroups.find(group => group.slug === slug))
    .filter(Boolean);
}, [filterGroups, selectedMainFilters]);

const availableSubFilterCategories = useMemo(() => {
  const categoryMap = new Map();

  selectedMainFilterGroups.forEach(group => {
    const children = Array.isArray(group.children) ? group.children : [];

    children.forEach(child => {
      if (!child?.slug || !child?.name) return;

      if (!categoryMap.has(child.slug)) {
        categoryMap.set(child.slug, child);
      }
    });
  });

  return Array.from(categoryMap.values());
}, [selectedMainFilterGroups]);

const selectedSubFilterCategories = useMemo(() => {
  return selectedSubFilters
    .map(slug => availableSubFilterCategories.find(category => category.slug === slug))
    .filter(Boolean);
}, [availableSubFilterCategories, selectedSubFilters]);

const formatSelectedFilterLabel = (items, fallback = 'Select') => {
  if (!items.length) return fallback;

  if (items.length <= 2) {
    return items.map(item => item.name).join(', ');
  }

  return `${items[0].name}, ${items[1].name} +${items.length - 2}`;
};

const selectedFilterLabel = useMemo(() => {
  if (selectedSubFilterCategories.length > 0) {
    return formatSelectedFilterLabel(selectedSubFilterCategories);
  }

  return formatSelectedFilterLabel(selectedMainFilterGroups);
}, [selectedMainFilterGroups, selectedSubFilterCategories]);

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

const selectedColorFilterOptions = useMemo(() => {
  return selectedColorFilters
    .map(slug => availableColorFilters.find(color => color.slug === slug))
    .filter(Boolean);
}, [availableColorFilters, selectedColorFilters]);

const selectedColorFilterLabel = formatSelectedFilterLabel(selectedColorFilterOptions);

const productMatchesColorFilter = (product, colorSlugs) => {
  if (!colorSlugs.length) return true;

  return getProductColorFilterOptions(product).some(color => colorSlugs.includes(color.slug));
};

const isSizeFilterAttribute = (name) => {
  const value = String(name || '').trim().toLowerCase();

  return value === 'size' || value.includes('size');
};

const getSizeSortValue = (value) => {
  const text = String(value || '').trim().toLowerCase();

  const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(m|mo|month|months|y|yr|yrs|year|years)?/);

  if (rangeMatch) {
    const first = Number(rangeMatch[1]);
    const second = Number(rangeMatch[2]);
    const unit = rangeMatch[3] || '';
    const average = (first + second) / 2;

    if (unit.startsWith('y')) return average * 12;
    return average;
  }

  const singleMatch = text.match(/(\d+(?:\.\d+)?)\s*(m|mo|month|months|y|yr|yrs|year|years)?/);

  if (singleMatch) {
    const number = Number(singleMatch[1]);
    const unit = singleMatch[2] || '';

    if (unit.startsWith('y')) return number * 12;
    return number;
  }

  return 9999;
};

const getProductSizeFilterOptions = (product) => {
  const sizeMap = new Map();

  const addSize = (name, slug) => {
    const sizeName = String(name || slug || '').trim();
    const sizeSlug = getFilterSlug(slug || name);

    if (!sizeName || !sizeSlug) return;

    if (!sizeMap.has(sizeSlug)) {
      sizeMap.set(sizeSlug, {
        name: sizeName,
        slug: sizeSlug
      });
    }
  };

  const attributes = Array.isArray(product?.attributes) ? product.attributes : [];

  attributes.forEach(attribute => {
    const attributeName = attribute.attribute_name || attribute.name || '';

    if (!isSizeFilterAttribute(attributeName)) return;

    const options = Array.isArray(attribute.options) ? attribute.options : [];

    options.forEach(option => {
      addSize(
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

      if (!isSizeFilterAttribute(attributeName)) return;

      addSize(
        attribute.term_name || attribute.name || attribute.value || attribute.term_slug,
        attribute.term_slug || attribute.slug || attribute.value || attribute.term_name
      );
    });
  });

  return Array.from(sizeMap.values());
};

const availableSizeFilters = useMemo(() => {
  const sizeMap = new Map();

  display.forEach(product => {
    getProductSizeFilterOptions(product).forEach(size => {
      if (!sizeMap.has(size.slug)) {
        sizeMap.set(size.slug, size);
      }
    });
  });

  return Array.from(sizeMap.values()).sort((a, b) => {
    const sortA = getSizeSortValue(a.name);
    const sortB = getSizeSortValue(b.name);

    if (sortA !== sortB) return sortA - sortB;

    return a.name.localeCompare(b.name);
  });
}, [display]);

const selectedSizeFilterOptions = useMemo(() => {
  return selectedSizeFilters
    .map(slug => availableSizeFilters.find(size => size.slug === slug))
    .filter(Boolean);
}, [availableSizeFilters, selectedSizeFilters]);

const selectedSizeFilterLabel = formatSelectedFilterLabel(selectedSizeFilterOptions);

const productMatchesSizeFilter = (product, sizeSlugs) => {
  if (!sizeSlugs.length) return true;

  return getProductSizeFilterOptions(product).some(size => sizeSlugs.includes(size.slug));
};

const filteredDisplay = useMemo(() => {
  return display.filter(product => {
    const categories = Array.isArray(product.categories) ? product.categories : [];
    const productCategorySlugs = new Set(categories.map(category => category.slug).filter(Boolean));

    const matchesCategoryFilters = (() => {
      if (!selectedMainFilters.length && !selectedSubFilters.length) return true;

      const selectedSubSet = new Set(selectedSubFilters);

      if (selectedMainFilters.length > 0) {
        return selectedMainFilters.some(mainSlug => {
          const group = filterGroups.find(item => item.slug === mainSlug);
          const children = Array.isArray(group?.children) ? group.children : [];
          const selectedChildren = children
            .map(child => child.slug)
            .filter(slug => selectedSubSet.has(slug));

          if (selectedChildren.length > 0) {
            return selectedChildren.some(slug => productCategorySlugs.has(slug));
          }

          return productCategorySlugs.has(mainSlug);
        });
      }

      return selectedSubFilters.some(slug => productCategorySlugs.has(slug));
    })();

    const matchesColorFilter = productMatchesColorFilter(product, selectedColorFilters);
    const matchesSizeFilter = productMatchesSizeFilter(product, selectedSizeFilters);

    return matchesCategoryFilters && matchesColorFilter && matchesSizeFilter;
  });
}, [display, filterGroups, selectedMainFilters, selectedSubFilters, selectedColorFilters, selectedSizeFilters]);

const resetProductsPagePosition = ({ updateUrl = false, scroll = false } = {}) => {
  setVisibleCount(productsPerPage);

  if (updateUrl) {
    const next = new URLSearchParams(searchParams);
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  }

  if (scroll) {
    window.scrollTo(0, 0);
  }
};

const toggleFilterValue = (values, slug) => {
  return values.includes(slug)
    ? values.filter(value => value !== slug)
    : [...values, slug];
};

const handleMainFilterChange = (slug) => {
  const isRemoving = selectedMainFilters.includes(slug);
  const group = filterGroups.find(item => item.slug === slug);
  const childSlugs = Array.isArray(group?.children)
    ? group.children.map(child => child.slug).filter(Boolean)
    : [];

  setSelectedMainFilters(prev => toggleFilterValue(prev, slug));

  if (isRemoving && childSlugs.length > 0) {
    setSelectedSubFilters(prev => prev.filter(value => !childSlugs.includes(value)));
  }

  resetProductsPagePosition();
};

const handleSubFilterChange = (slug) => {
  setSelectedSubFilters(prev => toggleFilterValue(prev, slug));
  resetProductsPagePosition();
};

const handleColorFilterChange = (slug) => {
  setSelectedColorFilters(prev => toggleFilterValue(prev, slug));
  resetProductsPagePosition();
};

const handleSizeFilterChange = (slug) => {
  setSelectedSizeFilters(prev => toggleFilterValue(prev, slug));
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

const activeFilterCount =
  selectedMainFilters.length +
  selectedSubFilters.length +
  selectedColorFilters.length +
  selectedSizeFilters.length;

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
    <div className={`products-filter-panel-track${filterPanelView === 'category' ? ' is-category-view' : ''}${filterPanelView === 'color' ? ' is-color-view' : ''}${filterPanelView === 'size' ? ' is-size-view' : ''}`}>
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

{availableSizeFilters.length > 0 && (
  <button
    type="button"
    className="products-filter-drill-row"
    onClick={() => setFilterPanelView('size')}
  >
    <span className="products-filter-drill-label">Size</span>

    <span className="products-filter-drill-meta">
      <span className="products-filter-drill-value">{selectedSizeFilterLabel}</span>
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
            const isSelectedMain = selectedMainFilters.includes(group.slug);
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
                      const isSelectedSub = selectedSubFilters.includes(category.slug);

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
      const isSelectedColor = selectedColorFilters.includes(color.slug);

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
    <span>Size</span>
  </button>

  <div className="products-filter-checkbox-list">
    {availableSizeFilters.map(size => {
      const isSelectedSize = selectedSizeFilters.includes(size.slug);

      return (
        <button
          key={size.slug}
          type="button"
          className="products-filter-checkbox-row products-filter-size-row"
          role="checkbox"
          aria-checked={isSelectedSize}
          onClick={() => handleSizeFilterChange(isSelectedSize ? '' : size.slug)}
        >
          <span className={`products-filter-checkbox ${isSelectedSize ? 'is-checked' : ''}`}></span>
          <span className="products-filter-checkbox-label">{size.name}</span>
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
setSelectedMainFilters([]);
setSelectedSubFilters([]);
setSelectedColorFilters([]);
setSelectedSizeFilters([]);
setFilterPanelView('main');
resetProductsPagePosition();
}}
  >
    Clear
  </button>

<button
  type="button"
  className="products-filter-apply-button"
  onClick={() => {
    closeFilterPanel();
    resetProductsPagePosition({ updateUrl: true, scroll: true });
  }}
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