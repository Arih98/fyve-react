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
import Login from './Login';
import Signup from './Signup';
import { MenuContext } from './MenuContext';
import { CartProvider } from './CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import './App.css';
import './Header.css';
import ScrollManager from './components/ScrollManager';
import AnnouncementBar from './AnnouncementBar';
import Cart from './Cart';
import AccountOrders from './AccountOrders';
import AccountAddresses from './AccountAddresses';
import AccountDetails from './AccountDetails';

const ProductDetailWrapper = () => {
  return <ProductDetail />;
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

  return (
    <MenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      <CartProvider>
        <AuthProvider>
          <ScrollManager />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailWrapper />} />
              <Route path="/product-category/:slug" element={<CategoryProducts />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route
  path="/account/orders"
  element={
    <ProtectedRoute>
      <AccountOrders />
    </ProtectedRoute>
  }
/>
<Route
  path="/account/addresses"
  element={
    <ProtectedRoute>
      <AccountAddresses />
    </ProtectedRoute>
  }
/>
<Route
  path="/account/details"
  element={
    <ProtectedRoute>
      <AccountDetails />
    </ProtectedRoute>
  }
/>
              <Route path="/cart" element={<Cart />} />
            </Route>
          </Routes>
        </AuthProvider>
      </CartProvider>
    </MenuContext.Provider>
  );
}

const App = () => {
  return <AppContent />;
};

export default App;