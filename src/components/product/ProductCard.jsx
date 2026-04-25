import React, { useEffect, useState } from 'react';
import ProductPrice from './ProductPrice';

const ProductCard = ({
  item,
  index,
  onProductClick,
  imageRefs,
  placeholderImage
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
const titleWords = String(item.title || '').trim().split(/\s+/).filter(Boolean);
const firstTitleLine = titleWords.slice(0, 2).join(' ');
const secondTitleLine = titleWords.slice(2, 4).join(' ');
const remainingTitleLine = titleWords.slice(4).join(' ');

  const imageSrc =
    item.gallery && item.gallery.length > 0
      ? item.gallery[0]
      : placeholderImage;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, index * 35);

    return () => clearTimeout(timeout);
  }, [index]);

  return (
    <div
      onClick={(e) => onProductClick(item, e)}
      className={`product-card real-product-card ${isVisible ? 'card-visible' : ''}`}
    >
      <div className="product-image-frame">
  <div
  id={`img-${item.displayId}`}
  className="product-image-wrapper"
>
  <img
    ref={el => {
  if (el) {
    imageRefs.current.set(item.displayId, el);
  } else {
    imageRefs.current.delete(item.displayId);
  }
}}
    src={imageSrc}
    alt={item.title}
    className={`product-image real-product-image ${imageLoaded ? 'image-loaded' : ''}`}
      onLoad={() => setImageLoaded(true)}
      onError={e => {
        e.target.src = placeholderImage;
        setImageLoaded(true);
      }}
    />
  </div>
</div>

      <div className="product-info">
<h3 className="product-title">
  <span className="product-title-line">{firstTitleLine}</span>
  {secondTitleLine && (
    <span className="product-title-line">{secondTitleLine}</span>
  )}
  {remainingTitleLine && (
    <span className="product-title-line">{remainingTitleLine}</span>
  )}
</h3>
        <ProductPrice price={item.price} />
      </div>
    </div>
  );
};

export default ProductCard;