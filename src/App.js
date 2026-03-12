import React, { useState, useEffect, createContext, useContext, useRef, useMemo } from 'react';
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
      if (!containerRef.current) return;
      const motionEl = containerRef.current.querySelector('[data-route-shell="true"]');
      const contentHeight = motionEl?.scrollHeight || 0;
      containerRef.current.style.height = `${contentHeight}px`;
      if (lenis?.resize) lenis.resize();
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    const interval = setInterval(updateHeight, 100);

    return () => {
      window.removeEventListener('resize', updateHeight);
      clearInterval(interval);
    };
  }, [lenis]);

  return (
    <div className="App" ref={containerRef} style={{ position: 'relative' }}>
      {showMobileTopHeader && <MobileTopHeader />}
      {showHeader && <Header />}
      {showCart && <Cart />}
      <LayoutGroup>
        <AnimatePresence initial={false}>
          <motion.div
            key={location.pathname}
            data-route-shell="true"
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
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 768);
  const lenisRef = useRef(null);
  const rafRef = useRef(null);
  const scrollTriggerUpdateRef = useRef(null);

  useEffect(() => {
    const handlePopState = () => {
      console.log('Browser history popstate event triggered (back or forward)');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (scrollTriggerUpdateRef.current) {
        gsap.ticker.remove(scrollTriggerUpdateRef.current);
        scrollTriggerUpdateRef.current = null;
      }

      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }

      ScrollTrigger.defaults({ scroller: window });
      ScrollTrigger.refresh();

      return;
    }

    const lenis = new Lenis({
      duration: 1.5,
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 3,
      smoothTouch: false,
      touchMultiplier: 1,
      infinite: false,
      easing: t => 1 - Math.pow(1 - t, 6)
    });

    lenisRef.current = lenis;

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on('scroll', onLenisScroll);

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
      pinType: 'transform'
    });

    ScrollTrigger.defaults({ scroller: document.body });

    const updateScrollTrigger = () => {
      ScrollTrigger.update();
    };

    scrollTriggerUpdateRef.current = updateScrollTrigger;
    gsap.ticker.add(updateScrollTrigger);
    gsap.ticker.lagSmoothing(0);

    const raf = time => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);
    ScrollTrigger.refresh();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (scrollTriggerUpdateRef.current) {
        gsap.ticker.remove(scrollTriggerUpdateRef.current);
        scrollTriggerUpdateRef.current = null;
      }

      lenis.off('scroll', onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;

      ScrollTrigger.defaults({ scroller: window });
      ScrollTrigger.refresh();
    };
  }, [isDesktop]);

  const lenisValue = useMemo(() => lenisRef.current, [isDesktop]);

  return (
    <LenisContext.Provider value={lenisValue}>
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