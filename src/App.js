import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Routes, Route, useLocation, useOutlet } from 'react-router-dom';
import Home from './Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './ProductDetail';
import Header from './Header';
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
import './HomeHeader.css';
import Lenis from '@studio-freight/lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

export const LenisContext = createContext(null);

const Layout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const showHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showCart = location.pathname !== '/admin';
  const containerRef = useRef(null);
  const lenis = useContext(LenisContext);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const contentHeight = containerRef.current.querySelector('[data-route-shell="true"]')?.scrollHeight || 0;
        containerRef.current.style.height = `${contentHeight}px`;
        lenis?.resize();
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    const interval = setInterval(updateHeight, 100);

    return () => {
      window.removeEventListener('resize', updateHeight);
      clearInterval(interval);
    };
  }, [lenis, location.pathname, location.search]);

  return (
    <div className="App" ref={containerRef} style={{ position: 'relative' }}>
      {showHeader && <Header />}
      {showCart && <Cart />}

      <LayoutGroup>
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={`${location.pathname}${location.search}`}
            data-route-shell="true"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 0 }}
          >
            {outlet}
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

  const lenis = new Lenis({
    duration: 1.5,
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 3,
    smoothTouch: true,
    touchMultiplier: 2,
    infinite: false,
    easing: (t) => 1 - Math.pow(1 - t, 6)
  });

  lenis.on('scroll', (data) => {
    console.log(data);
  });

  gsap.registerPlugin(ScrollTrigger);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy('body', {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: 'transform'
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return (
    <LenisContext.Provider value={lenis}>
      <MenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/product-category/:slug" element={<CategoryProducts />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Routes>
        </CartProvider>
      </MenuContext.Provider>
    </LenisContext.Provider>
  );
}

const App = () => {
  return <AppContent />;
};

export default App;