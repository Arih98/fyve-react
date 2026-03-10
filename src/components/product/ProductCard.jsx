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
  const imageSrc =
    item.gallery && item.gallery.length > 0
      ? item.gallery[0]
      : placeholderImage;

  const layoutId = `product-image-${item.displayId}`;

  return (
    <div
      key={`${item.displayId}-${index}`}
      onClick={(e) => onClick(item, e)}
      className="product-card"
    >
      <div
        ref={el => {
          imageRefs.current.set(item.displayId, el);
        }}
        id={`img-${item.displayId}`}
        className="product-image-wrapper"
      >
        <motion.div
          initial={false}
          layoutId={layoutId}
          className="product-image-inner"
          onLayoutAnimationStart={() => {
            const el = imageRefs.current.get(item.displayId);
            if (el) {
              el.style.zIndex = '10000';
            }
          }}
          onLayoutAnimationComplete={() => {
            const el = imageRefs.current.get(item.displayId);
            if (el) {
              el.style.zIndex = '';
            }
          }}
        >
          <img
            src={imageSrc}
            alt={item.title}
            className="product-image"
            onError={e => { e.target.src = placeholderImage; }}
          />
        </motion.div>
      </div>

      <div className="product-info">
        <h3 className="product-title">{item.title}</h3>
        <ProductPrice price={item.price} />
      </div>
    </div>
  );
};

export default ProductCard;