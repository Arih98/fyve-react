// Updated App.js
import React, { useState, useEffect, createContext } from 'react';
import { Routes, Route, useLocation, useOutlet } from 'react-router-dom';
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
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import './App.css';
import './Header.css';
import './HomeHeader.css';
import SearchResults from './SearchResults';

export const ProductsContext = createContext({ products: [], categories: [] });

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

const AnimatedOutlet = () => {
  return useOutlet();
}

const StableOutlet = () => {
  const o = useOutlet();
  const [outlet] = useState(o);
  return outlet;
};

const Layout = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showCart = location.pathname !== '/admin';

  return (
    <div className="App" style={{ position: 'relative' }}>
      {showHeader && <Header />}
      {showCart && <Cart />}
      <LayoutGroup>
        <AnimatePresence initial={false}>
          <motion.div
            key={location.pathname}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
          >
            <StableOutlet />
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
};

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const handlePopState = () => {
      console.log('Browser history popstate event triggered (back or forward)');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const localProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(localProducts);
    fetch('/api/manage_categories.php').then(res => res.json()).then(setCategories);
  }, []);

  return (
    <MenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      <CartProvider>
        <ProductsContext.Provider value={{products, categories}}>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetailWrapper />} />
              <Route path="/product-category/:slug" element={<CategoryProducts />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/search" element={<SearchResults />} />
            </Route>
          </Routes>
        </ProductsContext.Provider>
      </CartProvider>
    </MenuContext.Provider>
  );
}

const App = () => {
  return <AppContent />;
};

export default App;