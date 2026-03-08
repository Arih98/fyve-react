import React from 'react';
import { motion } from 'framer-motion';
import ProductPrice from './ProductPrice';

const ProductCard = ({
  item,
  index,
  onClick,
  imageRefs,
  placeholderImage
}) => {
  return (
    <div
      key={`${item.displayId}-${index}`}
      onClick={(e) => onClick(item, e)}
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
            : placeholderImage
        }
        alt={item.title}
        onError={e => { e.target.src = placeholderImage; }}
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
        <ProductPrice price={item.price} />
      </div>
    </div>
  );
};

export default ProductCard;