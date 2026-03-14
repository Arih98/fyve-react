import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Home from './Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './ProductDetail';
import Header from './Header';
import MobileTopHeader from './MobileTopHeader';
import Admin from './Admin';
import Cart from './Cart';
import CategoryProducts from './CategoryProducts';
import Checkout from './Checkout';
import Account from './Account';
import { MenuContext } from './MenuContext';
import { CartProvider } from './CartContext';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import './App.css';
import './Header.css';
import ScrollManager from './components/ScrollManager';

const ProductDetailWrapper = () => {
  const location = useLocation();
  return <ProductDetail key={location.key} />;
};

const Layout = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/admin';
  const showMobileTopHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showCart = location.pathname !== '/admin';

  return (
    <div className="App">
      {showMobileTopHeader && <MobileTopHeader />}
      {showHeader && <Header />}
      {showCart && <Cart />}
      <LayoutGroup>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={location.pathname + location.search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
};

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
useEffect(() => {
  const originalScrollTo = window.scrollTo;
  const originalScroll = window.scroll;
  const originalScrollIntoView = Element.prototype.scrollIntoView;
  const originalFocus = HTMLElement.prototype.focus;

  window.scrollTo = function (...args) {
    console.log("DEBUG window.scrollTo called with:", args);
    console.trace("window.scrollTo stack");
    return originalScrollTo.apply(window, args);
  };

  window.scroll = function (...args) {
    console.log("DEBUG window.scroll called with:", args);
    console.trace("window.scroll stack");
    return originalScroll.apply(window, args);
  };

  Element.prototype.scrollIntoView = function (...args) {
    console.log("DEBUG scrollIntoView called on:", this);
    console.log("DEBUG scrollIntoView args:", args);
    console.trace("scrollIntoView stack");
    return originalScrollIntoView.apply(this, args);
  };

  HTMLElement.prototype.focus = function (...args) {
    console.log("DEBUG focus called on:", this);
    console.log("DEBUG focus args:", args);
    console.trace("focus stack");
    return originalFocus.apply(this, args);
  };

  return () => {
    window.scrollTo = originalScrollTo;
    window.scroll = originalScroll;
    Element.prototype.scrollIntoView = originalScrollIntoView;
    HTMLElement.prototype.focus = originalFocus;
  };
}, []);
  useEffect(() => {
    const handlePopState = () => {
      console.log('Browser history popstate event triggered (back or forward)');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
useEffect(() => {
  const debugScroll = () => {
    console.log("GLOBAL scroll position:", window.scrollY);
  };

  window.addEventListener("scroll", debugScroll);

  return () => window.removeEventListener("scroll", debugScroll);
}, []);

useEffect(() => {
  const logNow = (label) => {
    console.log(label, window.scrollY);
  };

  logNow("APP immediate scrollY:");

  requestAnimationFrame(() => {
    logNow("APP rAF 1 scrollY:");
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      logNow("APP rAF 2 scrollY:");
    });
  });

  window.addEventListener("load", () => logNow("WINDOW load scrollY:"));
  window.addEventListener("pageshow", () => logNow("WINDOW pageshow scrollY:"));

  setTimeout(() => logNow("APP 100ms scrollY:"), 100);
  setTimeout(() => logNow("APP 500ms scrollY:"), 500);
  setTimeout(() => logNow("APP 1000ms scrollY:"), 1000);
}, []);
  return (
    <MenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      <CartProvider>
        <ScrollManager />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailWrapper />} />
            <Route path="/product-category/:slug" element={<CategoryProducts />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </CartProvider>
    </MenuContext.Provider>
  );
}

const App = () => {
  return <AppContent />;
};

export default App;