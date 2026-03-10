import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({
  products,
  onProductClick,
  imageRefs,
  placeholderImage
}) => {
  return (
    <div className="products-grid">
      {products.map((item, idx) => (
        <ProductCard
          key={`${item.displayId}-${idx}`}
          item={item}
          index={idx}
          onProductClick={onProductClick}
          imageRefs={imageRefs}
          placeholderImage={placeholderImage}
        />
      ))}
    </div>
  );
};

export default ProductGrid;