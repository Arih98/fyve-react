import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handlePopState = () => {
      console.log('Browser history popstate event triggered (back or forward)');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <MenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetailWrapper />} />
            <Route path="/product-category/:slug" element={<CategoryProducts />} />
            <Route path="/checkout" element={<Checkout />} />
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

Here is my current App.css:

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base styles */
html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #fff;
}

/* Custom components */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }
  .btn-secondary {
    @apply bg-gray-600 text-white hover:bg-gray-700;
  }
  .btn-success {
    @apply bg-green-600 text-white hover:bg-green-700;
  }
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700;
  }
  .input {
    @apply w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }
  .table {
    @apply w-full border-collapse;
  }
  .table th {
    @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
  }
  .table td {
    @apply px-6 py-4 whitespace-nowrap text-sm;
  }
}

/* Remove scrollbar but keep scrollable */
html, body {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
html::-webkit-scrollbar, body::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

/* Ensure container is centered */
.container {
  @apply mx-auto px-4 sm:px-6 lg:px-8;
}