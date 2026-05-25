import React from 'react';

const formatPrice = (value) => {
  const number = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(number) ? number.toFixed(2) : '';
};

const ProductPrice = ({ price }) => {
  const current = price?.current ?? price ?? 0;
  const regular = price?.regular ?? current;
  const isOnSale =
    Boolean(price?.isOnSale) ||
    Number(regular) > Number(current);

  return (
    <p className={`product-price ${isOnSale ? 'is-on-sale' : ''}`}>
      {isOnSale ? (
        <>
          <span className="product-price-current">${formatPrice(current)}</span>
          {' '}
          <span className="product-price-regular">${formatPrice(regular)}</span>
        </>
      ) : (
        <span className="product-price-current">${formatPrice(current)}</span>
      )}
    </p>
  );
};

export default ProductPrice;