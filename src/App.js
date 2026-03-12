import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Routes, Route, useLocation, useOutlet } from 'react-router-dom';
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
import './HomeHeader.css';
import Lenis from '@studio-freight/lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import ScrollManager from './components/ScrollManager';

export const LenisContext = createContext(null);

const ProductDetailWrapper = () => {
  const location = useLocation();
  return <ProductDetail key={location.key} />;
};

const StableOutlet = () => {
  const o = useOutlet();
  const [outlet] = useState(o);
  return outlet;
};

const Layout = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showMobileTopHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showCart = location.pathname !== '/admin';
  const containerRef = useRef(null);
  const lenis = useContext(LenisContext);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const contentHeight = containerRef.current.scrollHeight || 0;
        containerRef.current.style.height = `${contentHeight}px`;
        lenis?.resize();
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [lenis, location.pathname]);

  return (
    <div className="App" ref={containerRef} style={{ position: 'relative' }}>
      {showMobileTopHeader && <MobileTopHeader />}
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
  const lenisRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: true,
      touchMultiplier: 1.5,
      mouseMultiplier: 1,
      infinite: false,
      easing: (t) => 1 - Math.pow(1 - t, 6)
    });

    lenisRef.current = lenis;

    const onScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on('scroll', onScroll);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      },
      pinType: document.body.style.transform ? 'transform' : 'fixed'
    });

    let rafId;

    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
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
    </LenisContext.Provider>
  );
}

const App = () => {
  return <AppContent />;
};

export default App;