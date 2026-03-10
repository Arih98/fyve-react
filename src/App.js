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
import ScrollManager from './components/ScrollManager';

export const LenisContext = createContext(null);

const ProductDetailWrapper = () => {
  return <ProductDetail />;
};

const AnimatedOutlet = () => {
  return useOutlet();
};

const Layout = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showCart = location.pathname !== '/admin';
  const containerRef = useRef(null);
  const lenis = useContext(LenisContext);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const contentHeight = containerRef.current.querySelector('div')?.scrollHeight || 0;
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
  }, [lenis, location.pathname, location.key]);

  return (
    <div className="App" ref={containerRef} style={{ position: 'relative' }}>
      {showHeader && <Header />}
      {showCart && <Cart />}
      <LayoutGroup>
        <AnimatePresence initial={false}>
          <motion.div
            key={location.key}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
          >
            <AnimatedOutlet />
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
};

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
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

    setLenis(lenisInstance);

    gsap.registerPlugin(ScrollTrigger);

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };

    lenisInstance.on('scroll', onLenisScroll);
    gsap.ticker.add(ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy('body', {
      scrollTop(value) {
        if (arguments.length) {
          lenisInstance.scrollTo(value, { immediate: true });
        }
        return lenisInstance.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: 'transform'
    });

    let rafId;

    const raf = (time) => {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.off('scroll', onLenisScroll);
      gsap.ticker.remove(ScrollTrigger.update);
      lenisInstance.destroy();
    };
  }, []);

  if (!lenis) return null;

  return (
    <LenisContext.Provider value={lenis}>
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