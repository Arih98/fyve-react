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