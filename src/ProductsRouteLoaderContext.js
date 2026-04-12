import { createContext } from 'react';

export const ProductsRouteLoaderContext = createContext({
  isProductsRouteLoading: false,
  setIsProductsRouteLoading: () => {}
});