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
      imageRefs.current.set(item.displayId, el);
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
        <h3 className="product-title">{item.title}</h3>
        <ProductPrice price={item.price} />
      </div>
    </div>
  );
};

export default ProductCard;