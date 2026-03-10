import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { isMenuOpen } = useContext(MenuContext);
  const imageRefs = useRef(new Map());
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

  const handleProductClick = (item, e) => {
    const wrapperElement = imageRefs.current.get(item.displayId);
    const imgElement = wrapperElement?.querySelector('img');

    const rect = wrapperElement ? wrapperElement.getBoundingClientRect() : null;
    const imgRect = imgElement ? imgElement.getBoundingClientRect() : null;

    console.log('[PLP CLICK] before navigate', {
      displayId: item.displayId,
      parentId: item.parentId,
      title: item.title,
      selectedColor: item.selectedColor,
      scrollY: window.scrollY,
      viewport: {
        wrapperTop: rect?.top ?? null,
        wrapperLeft: rect?.left ?? null,
        wrapperWidth: rect?.width ?? null,
        wrapperHeight: rect?.height ?? null,
        imgTop: imgRect?.top ?? null,
        imgLeft: imgRect?.left ?? null,
        imgWidth: imgRect?.width ?? null,
        imgHeight: imgRect?.height ?? null
      },
      document: {
        wrapperTop: rect ? rect.top + window.scrollY : null,
        wrapperLeft: rect ? rect.left + window.scrollX : null,
        imgTop: imgRect ? imgRect.top + window.scrollY : null,
        imgLeft: imgRect ? imgRect.left + window.scrollX : null
      },
      viewportMeta: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      }
    });

    const targetProduct = products.find((p) => p.id === item.parentId);
    if (!targetProduct) {
      console.error('[PLP CLICK] target product not found', { parentId: item.parentId });
      return;
    }

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

  console.log('[Products] Rendering', currentProducts.length, 'of', display.length);

  return (
    <div className="products-container">
      <div className={`page-wrapper${isMenuOpen ? ' menu-open' : ''}`}>
        <ProductGrid
          products={currentProducts}
          onProductClick={handleProductClick}
          imageRefs={imageRefs}
          placeholderImage={placeholderImage}
        />

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