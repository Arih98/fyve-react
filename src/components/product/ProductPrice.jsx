import React from 'react';

const ProductPrice = ({ price }) => {
  const current = price?.current ?? 0;
  const regular = price?.regular ?? current;
  const isOnSale = !!price?.isOnSale;

  return (
    <p className="product-price">
      {isOnSale ? (
        <>
          <span>${current}</span>
          {' '}
          <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>${regular}</span>
        </>
      ) : (
        <span>${current}</span>
      )}
    </p>
  );
};

export default ProductPrice;