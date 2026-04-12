import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Home from './Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './ProductDetail';
import Header from './Header';
import MobileTopHeader from './MobileTopHeader';
import Admin from './Admin';
import CategoryProducts from './CategoryProducts';
import Checkout from './Checkout';
import Account from './Account';
import { MenuContext } from './MenuContext';
import { CartProvider } from './CartContext';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ProductsPageTransitionProvider, useProductsPageTransition } from './ProductsPageTransitionContext';
import './App.css';
import './Header.css';
import ScrollManager from './components/ScrollManager';
import AnnouncementBar from './AnnouncementBar';
import Cart from './Cart';

const ProductDetailWrapper = () => {
  return <ProductDetail />;
};

const ProductsPageTransitionOverlay = () => {
  const { transitionState } = useProductsPageTransition();

  return (
    <div className={`products-page-transition products-page-transition-${transitionState}`} aria-hidden={transitionState === 'idle'}>
      <div className="products-page-transition-inner">
        <img
          src="/assets/FYVE-Dark-Logo.svg"
          alt="FYVE Logo"
          className="products-page-transition-logo"
        />
        <div className="products-page-transition-text">
          <div className="products-page-transition-fyve">FYVE</div>
          <div className="products-page-transition-london">LONDON</div>
        </div>
      </div>
    </div>
  );
};

const Layout = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/admin';
  const showMobileTopHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showAnnouncementBar = location.pathname !== '/admin';

  return (
    <div className="App">
      {showAnnouncementBar && <AnnouncementBar />}
      {showMobileTopHeader && <MobileTopHeader />}
      {showHeader && <Header />}
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
      <ProductsPageTransitionOverlay />
    </div>
  );
};

function AppContentInner() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { startProductsPageTransition } = useProductsPageTransition();

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
    const handleClickCapture = (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest('a[href]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http')) return;
      if (href.startsWith('mailto:')) return;
      if (href.startsWith('tel:')) return;

      const url = new URL(anchor.href, window.location.origin);
      const nextPath = `${url.pathname}${url.search}${url.hash}`;
      const currentPath = `${location.pathname}${location.search}${location.hash}`;

      if (url.pathname !== '/products') return;
      if (nextPath === currentPath) return;

      event.preventDefault();
      startProductsPageTransition(nextPath);
    };

    document.addEventListener('click', handleClickCapture, true);

    return () => {
      document.removeEventListener('click', handleClickCapture, true);
    };
  }, [location.pathname, location.search, location.hash, startProductsPageTransition]);

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
            <Route path="/cart" element={<Cart />} />
          </Route>
        </Routes>
      </CartProvider>
    </MenuContext.Provider>
  );
}

function AppContent() {
  return (
    <ProductsPageTransitionProvider>
      <AppContentInner />
    </ProductsPageTransitionProvider>
  );
}

const App = () => {
  return <AppContent />;
};

export default App;