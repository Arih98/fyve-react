import React from 'react';
import ProductPrice from './ProductPrice';

const ProductCard = ({
  item,
  index,
  onProductClick,
  imageRefs,
  placeholderImage
}) => {
  const imageSrc =
    item.gallery && item.gallery.length > 0
      ? item.gallery[0]
      : placeholderImage;

  return (
    <div
      key={`${item.displayId}-${index}`}
      onClick={(e) => onProductClick(item, e)}
      className="product-card"
    >
      <div
        ref={el => {
          imageRefs.current.set(item.displayId, el);
        }}
        id={`img-${item.displayId}`}
        className="product-image-wrapper"
      >
        <img
          src={imageSrc}
          alt={item.title}
          className="product-image"
          onError={e => { e.target.src = placeholderImage; }}
        />
      </div>

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