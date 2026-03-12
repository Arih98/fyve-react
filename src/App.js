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
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import ScrollManager from './components/ScrollManager';

export const LenisContext = createContext(null);

const ProductDetailWrapper = () => {
  const location = useLocation();
  return <ProductDetail key={location.key} />;
};

const AnimatedOutlet = () => {
  return useOutlet();
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
        const contentHeight = containerRef.current.firstElementChild?.scrollHeight || 0;
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
const [lenisInstance, setLenisInstance] = useState(null);
const lenisRef = useRef(null);
const rafRef = useRef(null);
const location = useLocation();

  useEffect(() => {
    const handlePopState = () => {
      console.log('Browser history popstate event triggered (back or forward)');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;

const lenis = new Lenis({
  smoothWheel: true,
  syncTouch: true,
  syncTouchLerp: 0.075,
  touchMultiplier: 1,
  wheelMultiplier: 1,
  infinite: false
});

console.log('[APP] lenis created', {
  syncTouch: true,
  smoothWheel: true,
  touchMultiplier: 1,
  wheelMultiplier: 1,
  infinite: false,
  initialLenisScroll: lenis.scroll,
  initialWindowScrollY: window.scrollY
});

    lenisRef.current = lenis;
    setLenisInstance(lenis);

const onScroll = () => {
  ScrollTrigger.update();
  console.log('[APP] lenis scroll event', {
    lenisScroll: lenis.scroll,
    windowScrollY: window.scrollY,
    documentScrollTop: document.documentElement.scrollTop,
    bodyScrollTop: document.body.scrollTop
  });
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
      pinType: 'transform'
    });

    const raf = (time) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);
    gsap.ticker.lagSmoothing(0);

return () => {
  if (rafRef.current) cancelAnimationFrame(rafRef.current);
  lenis.off('scroll', onScroll);
  console.log('[APP] lenis cleanup', {
    finalLenisScroll: lenis.scroll,
    finalWindowScrollY: window.scrollY
  });
  lenis.destroy();
  lenisRef.current = null;
  setLenisInstance(null);
};
  }, []);

  useEffect(() => {
  console.log('[APP] route changed', {
    pathname: location.pathname,
    search: location.search,
    key: location.key,
    state: location.state,
    windowScrollY: window.scrollY,
    lenisScroll: lenisRef.current?.scroll ?? null,
    docHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight
  });
}, [location]);

useEffect(() => {
  const onWindowScroll = () => {
    console.log('[APP] window scroll event', {
      windowScrollY: window.scrollY,
      documentScrollTop: document.documentElement.scrollTop,
      bodyScrollTop: document.body.scrollTop,
      lenisScroll: lenisRef.current?.scroll ?? null,
      docHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight
    });
  };

  window.addEventListener('scroll', onWindowScroll, { passive: true });
  return () => window.removeEventListener('scroll', onWindowScroll);
}, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
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