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
import AnnouncementBar from './AnnouncementBar';
import { MobileSplitTransitionProvider } from './components/MobileSplitTransition';

const ProductDetailWrapper = () => {
  return <ProductDetail />;
};

const Layout = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/admin';
  const showMobileTopHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showCart = location.pathname !== '/admin';
  const showAnnouncementBar = location.pathname !== '/admin';

  return (
    <MobileSplitTransitionProvider>
      <div className="App">
        {showAnnouncementBar && <AnnouncementBar />}
        {showMobileTopHeader && <MobileTopHeader />}
        {showHeader && <Header />}
        {showCart && <Cart />}
        <div className={location.pathname === '/' ? '' : 'site-content'}>
          <LayoutGroup>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={location.pathname + location.search}
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>
    </MobileSplitTransitionProvider>
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
      return originalScrollTo.apply(window, args);
    };

    window.scroll = function (...args) {
      return originalScroll.apply(window, args);
    };

    Element.prototype.scrollIntoView = function (...args) {
      return originalScrollIntoView.apply(this, args);
    };

    HTMLElement.prototype.focus = function (...args) {
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
    const handlePopState = () => {};

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const debugScroll = () => {};

    window.addEventListener('scroll', debugScroll);

    return () => window.removeEventListener('scroll', debugScroll);
  }, []);

  useEffect(() => {
    const logNow = () => {};

    logNow();

    requestAnimationFrame(() => {
      logNow();
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        logNow();
      });
    });

    window.addEventListener('load', () => logNow());
    window.addEventListener('pageshow', () => logNow());

    setTimeout(() => logNow(), 100);
    setTimeout(() => logNow(), 500);
    setTimeout(() => logNow(), 1000);
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