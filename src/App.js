import React, { useState, useEffect, forwardRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './Home';
import Products from './Products';
import ProductDetail from './ProductDetail';
import Header from './Header';
import Admin from './Admin';
import Cart from './Cart';
import CategoryProducts from './CategoryProducts';
import Checkout from './Checkout';
import { MenuContext } from './MenuContext';
import { CartProvider } from './CartContext';
import './App.css';
import './Header.css';
import './HomeHeader.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const ProductDetailWrapper = () => {
  const location = useLocation();
  return <ProductDetail key={location.key} />;
}

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const showHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showCart = location.pathname !== '/admin';

  useEffect(() => {
    const handlePopState = () => {
      console.log('Browser history popstate event triggered (back or forward)');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const AnimatedRoutes = forwardRef((props, ref) => (
    <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <Routes location={props.location}>
        {props.children}
      </Routes>
    </div>
  ));

  return (
    <MenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      <CartProvider>
        <div className="App">
          {showHeader && <Header />}
          {showCart && <Cart />}
          <ScrollToTop />
          <AnimatePresence mode="popLayout">
            <AnimatedRoutes location={location} key={location.key}>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetailWrapper />} />
              <Route path="/product-category/:slug" element={<CategoryProducts />} />
              <Route path="/checkout" element={<Checkout />} />
            </AnimatedRoutes>
          </AnimatePresence>
        </div>
      </CartProvider>
    </MenuContext.Provider>
  );
}

// Remove the outer <Router> since it's in index.js
const App = () => {
  return <AppContent />;
};

export default App;