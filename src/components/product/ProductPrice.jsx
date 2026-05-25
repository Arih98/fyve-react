import React from 'react';

const formatPrice = (value) => {
  const number = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(number) ? number.toFixed(2) : '';
};

const ProductPrice = ({ price }) => {
  const current = price?.current ?? 0;
  const regular = price?.regular ?? current;
  const isOnSale = !!price?.isOnSale;

  return (
    <p className="product-price">
      {isOnSale ? (
        <>
          <span>${formatPrice(current)}</span>
          {' '}
          <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>${regular}</span>
        </>
      ) : (
        <span>${formatPrice(current)}</span>
      )}
    </p>
  );
};

export default ProductPrice;