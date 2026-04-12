import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductsRouteLoaderContext } from '../ProductsRouteLoaderContext';

export const useProductsNavigation = () => {
  const navigate = useNavigate();
  const { setIsProductsRouteLoading } = useContext(ProductsRouteLoaderContext);

  return useCallback((path = '/products', options = {}) => {
    setIsProductsRouteLoading(true);
    navigate(path, options);
  }, [navigate, setIsProductsRouteLoading]);
};