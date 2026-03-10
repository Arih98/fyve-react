import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ProductCard = ({ item, onProductClick, imageRefs, placeholderImage }) => {
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);
  const layoutId = `product-image-${item.displayId}`;

  useEffect(() => {
    const el = wrapperRef.current;
    const img = imgRef.current;

    const logRect = (label) => {
      console.log(`[ProductCard ${item.displayId}] ${label}`, {
        layoutId,
        scrollY: window.scrollY,
        wrapperRect: el ? el.getBoundingClientRect() : null,
        wrapperClientWidth: el ? el.clientWidth : null,
        wrapperClientHeight: el ? el.clientHeight : null,
        imgRect: img ? img.getBoundingClientRect() : null,
        imgComplete: img ? img.complete : null,
        imgCurrentSrc: img ? (img.currentSrc || img.src) : null,
        naturalWidth: img ? img.naturalWidth : null,
        naturalHeight: img ? img.naturalHeight : null
      });
    };

    logRect('mounted');

    requestAnimationFrame(() => {
      logRect('mounted rAF 1');
      requestAnimationFrame(() => {
        logRect('mounted rAF 2');
      });
    });

    setTimeout(() => logRect('mounted +100ms'), 100);
    setTimeout(() => logRect('mounted +300ms'), 300);

    return () => {
      logRect('unmounting');
    };
  }, [item.displayId, layoutId]);

  return (
    <div
      className="product-card"
      onClick={(e) => {
        console.log(`[ProductCard ${item.displayId}] click`, {
          hasOnProductClick: typeof onProductClick === 'function',
          onProductClickType: typeof onProductClick,
          scrollY: window.scrollY
        });

        if (typeof onProductClick === 'function') {
          onProductClick(item, e);
        } else {
          console.error(`[ProductCard ${item.displayId}] onProductClick is not a function`, {
            received: onProductClick
          });
        }
      }}
    >
      <motion.div
        ref={(el) => {
          wrapperRef.current = el;
          if (imageRefs?.current) {
            imageRefs.current.set(item.displayId, el);
          }
        }}
        layoutId={layoutId}
        className="product-image-wrapper"
        initial={false}
        onLayoutAnimationStart={() => {
          const el = wrapperRef.current;
          const img = imgRef.current;
          console.log(`[ProductCard ${item.displayId}] layout animation start`, {
            layoutId,
            scrollY: window.scrollY,
            wrapperRect: el ? el.getBoundingClientRect() : null,
            imgRect: img ? img.getBoundingClientRect() : null
          });
        }}
        onLayoutAnimationComplete={() => {
          const el = wrapperRef.current;
          const img = imgRef.current;
          console.log(`[ProductCard ${item.displayId}] layout animation complete`, {
            layoutId,
            scrollY: window.scrollY,
            wrapperRect: el ? el.getBoundingClientRect() : null,
            imgRect: img ? img.getBoundingClientRect() : null
          });
        }}
      >
        <img
          ref={imgRef}
          src={item.image || placeholderImage}
          alt={item.title}
          className="product-image"
          onLoad={(e) => {
            console.log(`[ProductCard ${item.displayId}] image load`, {
              layoutId,
              scrollY: window.scrollY,
              src: e.target.currentSrc || e.target.src,
              naturalWidth: e.target.naturalWidth,
              naturalHeight: e.target.naturalHeight,
              rect: e.target.getBoundingClientRect(),
              complete: e.target.complete
            });
          }}
          onError={(e) => {
            console.log(`[ProductCard ${item.displayId}] image error`, {
              layoutId,
              failedSrc: e.target.currentSrc || e.target.src
            });
            e.target.src = placeholderImage;
          }}
        />
      </motion.div>

      <div className="product-info">
        <h3 className="product-title">{item.title}</h3>
        <p className="product-price">${Number(item.price || 0).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;