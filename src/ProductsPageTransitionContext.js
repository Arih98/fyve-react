import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductsPageTransitionContext = createContext(null);

export const ProductsPageTransitionProvider = ({ children }) => {
  const navigate = useNavigate();
  const [transitionState, setTransitionState] = useState('idle');
  const timeoutsRef = useRef([]);

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const startProductsPageTransition = useCallback((to = '/products') => {
    if (transitionState !== 'idle') return;

    clearTimers();
    document.body.classList.add('products-transition-lock');
    setTransitionState('enter');

    timeoutsRef.current.push(
      setTimeout(() => {
        navigate(to);
      }, 70)
    );

    timeoutsRef.current.push(
      setTimeout(() => {
        setTransitionState('hold');
      }, 900)
    );

    timeoutsRef.current.push(
      setTimeout(() => {
        setTransitionState('exit');
      }, 1200)
    );

    timeoutsRef.current.push(
      setTimeout(() => {
        setTransitionState('idle');
        document.body.classList.remove('products-transition-lock');
      }, 2200)
    );
  }, [navigate, transitionState]);

  const value = useMemo(() => ({
    transitionState,
    startProductsPageTransition
  }), [transitionState, startProductsPageTransition]);

  return (
    <ProductsPageTransitionContext.Provider value={value}>
      {children}
    </ProductsPageTransitionContext.Provider>
  );
};

export const useProductsPageTransition = () => {
  const context = useContext(ProductsPageTransitionContext);

  if (!context) {
    throw new Error('useProductsPageTransition must be used within ProductsPageTransitionProvider');
  }

  return context;
};