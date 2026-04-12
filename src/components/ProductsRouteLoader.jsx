import React, { useContext } from 'react';
import { ProductsRouteLoaderContext } from '../ProductsRouteLoaderContext';
import './ProductsRouteLoader.css';

const ProductsRouteLoader = () => {
  const { isProductsRouteLoading } = useContext(ProductsRouteLoaderContext);

  if (!isProductsRouteLoading) return null;

  return (
    <div className="products-route-loader">
      <div className="products-route-loader-inner">
        <img
          src="/assets/FYVE-Dark-Logo.svg"
          alt="FYVE"
          className="products-route-loader-logo"
        />
        <div className="products-route-loader-text products-route-loader-fyve">
          FYVE
        </div>
        <div className="products-route-loader-text products-route-loader-london">
          LONDON
        </div>
      </div>
    </div>
  );
};

export default ProductsRouteLoader;