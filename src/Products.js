import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuContext } from './MenuContext';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import './Products.css';

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const { data: products, loading, error } = useProducts({
    page: 1,
    perPage: 200
  });
  const navigate = useNavigate();
  const { isMenuOpen } = useContext(MenuContext);
  const imageRefs = useRef(new Map());

  const display = products.map((product) => ({
    ...product,
    displayId: product.id,
    parentId: product.id,
    selectedColor: null,
    gallery: product.thumbnail ? [product.thumbnail, product.hoverImage].filter(Boolean) : [],
    title: product.name,
    image: product.thumbnail,
    rawPrice: product.price,
    price: product.price?.current ?? 0
  }));

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

    const targetProduct = products.find((p) => p.id === item.parentId);
    if (!targetProduct) {
      console.error('[Products] Target product not found for parentId:', item.parentId);
      return;
    }

    console.log('[Products] Navigating with product:', {
      id: targetProduct.id,
      title: targetProduct.name,
      initialColor: item.selectedColor,
      transitionKey: item.displayId
    });

    navigate(`/product/${item.parentId}`, {
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
                    : 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png'
                }
                alt={item.title}
                onError={e => { e.target.src = 'https://fyvelondon.com/wp-content/uploads/woocommerce-placeholder.png'; }}
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
                  £{item.price}
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

export default Products;