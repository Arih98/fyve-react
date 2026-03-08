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
      onClick={(e) => {
  console.log('[PLP] card click', {
    displayId: item.displayId,
    layoutId: `product-image-${item.displayId}`,
    title: item.title,
    image: item.gallery && item.gallery.length > 0 ? item.gallery[0] : placeholderImage
  });
  onClick(item, e);
}}
      className="product-card"
    >
      <motion.img
  initial={false}
  layoutId={`product-image-${item.displayId}`}
  ref={el => {
    imageRefs.current.set(item.displayId, el);
    if (el) {
      console.log('[PLP] image ref set', {
        displayId: item.displayId,
        layoutId: `product-image-${item.displayId}`,
        src: el.currentSrc || el.src,
        rect: el.getBoundingClientRect()
      });
    }
  }}
  id={`img-${item.displayId}`}
  src={
    item.gallery && item.gallery.length > 0
      ? item.gallery[0]
      : placeholderImage
  }
  alt={item.title}
  onError={e => { e.target.src = placeholderImage; }}
  onLoad={e => console.log('[PLP] image loaded', {
    displayId: item.displayId,
    layoutId: `product-image-${item.displayId}`,
    src: e.target.currentSrc || e.target.src,
    naturalWidth: e.target.naturalWidth,
    naturalHeight: e.target.naturalHeight,
    rect: e.target.getBoundingClientRect()
  })}
  className="product-image"
  onAnimationStart={() => console.log('[PLP] animation start', {
    displayId: item.displayId,
    layoutId: `product-image-${item.displayId}`
  })}
  onAnimationComplete={() => console.log('[PLP] animation complete', {
    displayId: item.displayId,
    layoutId: `product-image-${item.displayId}`
  })}
  onLayoutAnimationStart={() => {
    const el = imageRefs.current.get(item.displayId);
    console.log('[PLP] layout animation start', {
      displayId: item.displayId,
      layoutId: `product-image-${item.displayId}`,
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
      layoutId: `product-image-${item.displayId}`,
      hasElement: !!el,
      rect: el ? el.getBoundingClientRect() : null
    });
    if (el) {
      el.style.zIndex = '';
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