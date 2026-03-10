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
import Account from './Account'; // Add this import
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
  const containerRef = useRef(null);
  const pageMotionRef = useRef(null);
  const lenis = useContext(LenisContext);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current && pageMotionRef.current) {
        const contentHeight = pageMotionRef.current.scrollHeight || 0;
        containerRef.current.style.height = `${contentHeight}px`;
        lenis?.resize();

        console.log('[Layout] updateHeight', {
          pathname: location.pathname,
          locationKey: location.key,
          scrollY: window.scrollY,
          contentHeight,
          containerRect: containerRef.current.getBoundingClientRect(),
          pageRect: pageMotionRef.current.getBoundingClientRect()
        });
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

  useEffect(() => {
    console.log('[Layout] mounted route container', {
      pathname: location.pathname,
      locationKey: location.key,
      scrollY: window.scrollY,
      containerRect: containerRef.current ? containerRef.current.getBoundingClientRect() : null,
      pageRect: pageMotionRef.current ? pageMotionRef.current.getBoundingClientRect() : null
    });

    requestAnimationFrame(() => {
      console.log('[Layout] mounted route container rAF 1', {
        pathname: location.pathname,
        locationKey: location.key,
        scrollY: window.scrollY,
        containerRect: containerRef.current ? containerRef.current.getBoundingClientRect() : null,
        pageRect: pageMotionRef.current ? pageMotionRef.current.getBoundingClientRect() : null
      });

      requestAnimationFrame(() => {
        console.log('[Layout] mounted route container rAF 2', {
          pathname: location.pathname,
          locationKey: location.key,
          scrollY: window.scrollY,
          containerRect: containerRef.current ? containerRef.current.getBoundingClientRect() : null,
          pageRect: pageMotionRef.current ? pageMotionRef.current.getBoundingClientRect() : null
        });
      });
    });

    return () => {
      console.log('[Layout] unmounting route container', {
        pathname: location.pathname,
        locationKey: location.key,
        scrollY: window.scrollY,
        containerRect: containerRef.current ? containerRef.current.getBoundingClientRect() : null,
        pageRect: pageMotionRef.current ? pageMotionRef.current.getBoundingClientRect() : null
      });
    };
  }, [location.pathname, location.key]);

  return (
    <div className="App" ref={containerRef} style={{ position: 'relative' }}>
      {showHeader && <Header />}
      {showCart && <Cart />}
      <LayoutGroup>
        <AnimatePresence initial={false}>
          <motion.div
            ref={pageMotionRef}
            key={location.pathname}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
            onAnimationStart={() => {
              console.log('[Layout] route motion animation start', {
                pathname: location.pathname,
                locationKey: location.key,
                scrollY: window.scrollY,
                rect: pageMotionRef.current ? pageMotionRef.current.getBoundingClientRect() : null
              });
            }}
            onAnimationComplete={() => {
              console.log('[Layout] route motion animation complete', {
                pathname: location.pathname,
                locationKey: location.key,
                scrollY: window.scrollY,
                rect: pageMotionRef.current ? pageMotionRef.current.getBoundingClientRect() : null
              });
            }}
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
  console.log('[Lenis] scroll', {
    scroll: data?.scroll,
    limit: data?.limit,
    velocity: data?.velocity,
    direction: data?.direction,
    progress: data?.progress,
    windowScrollY: window.scrollY,
    pathname: window.location.pathname
  });
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
        <ScrollManager />
        <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailWrapper />} />
              <Route path="/product-category/:slug" element={<CategoryProducts />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<Account />} /> {/* Add this route */}
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