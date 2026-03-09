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
      onClick={(e) => {
        console.log('[PLP] card click', {
          displayId: item.displayId,
          layoutId,
          title: item.title,
          image: imageSrc
        });
        onClick(item, e);
      }}
      className="product-card"
    >
      <motion.div
        initial={false}
        layoutId={layoutId}
        ref={el => {
          imageRefs.current.set(item.displayId, el);
          if (el) {
            console.log('[PLP] wrapper ref set', {
              displayId: item.displayId,
              layoutId,
              rect: el.getBoundingClientRect()
            });
          }
        }}
        id={`img-${item.displayId}`}
        className="product-image-wrapper"
        onLayoutAnimationStart={() => {
          const el = imageRefs.current.get(item.displayId);
          console.log('[PLP] layout animation start', {
            displayId: item.displayId,
            layoutId,
            hasElement: !!el,
            rect: el ? el.getBoundingClientRect() : null
          });
          if (el) {
            el.style.zIndex = '10000';
          }
        }}
        onLayoutAnimationComplete={() => {
          const el = imageRefs.current.get(item.displayId);
          console.log('[PLP] layout animation complete', {
            displayId: item.displayId,
            layoutId,
            hasElement: !!el,
            rect: el ? el.getBoundingClientRect() : null
          });
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
          onLoad={e => console.log('[PLP] image loaded', {
            displayId: item.displayId,
            layoutId,
            src: e.target.currentSrc || e.target.src,
            naturalWidth: e.target.naturalWidth,
            naturalHeight: e.target.naturalHeight,
            rect: e.target.getBoundingClientRect()
          })}
        />
      </motion.div>

      <div className="product-info">
        <h3 className="product-title">{item.title}</h3>
        <ProductPrice price={item.price} />
      </div>
    </div>
  );
};

export default ProductCard;