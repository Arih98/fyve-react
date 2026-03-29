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
import AnnouncementBar from './AnnouncementBar';

const ProductDetailWrapper = () => {
  return <ProductDetail />;
};

const Layout = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/admin';
  const showMobileTopHeader = location.pathname !== '/' && location.pathname !== '/admin';
  const showCart = location.pathname !== '/admin';
  const showAnnouncementBar = location.pathname !== '/admin';

  return (
    <div className="App">
      {showAnnouncementBar && <AnnouncementBar />}
      {showMobileTopHeader && <MobileTopHeader />}
      {showHeader && <Header />}
      {showCart && <Cart />}
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

  let activeClone = null;
let activeAnimation = null;

const waitForElement = (getEl, { maxFrames = 90 } = {}) =>
  new Promise((resolve) => {
    let frame = 0;

    const check = () => {
      const el = getEl?.();

      if (el && el.isConnected) {
        resolve(el);
        return;
      }

      frame += 1;
      if (frame >= maxFrames) {
        resolve(null);
        return;
      }

      requestAnimationFrame(check);
    };

    check();
  });

const waitForNextFrame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const getRect = (el) => {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
};

const rectsMatch = (a, b, tolerance = 0.5) =>
  Math.abs(a.left - b.left) <= tolerance &&
  Math.abs(a.top - b.top) <= tolerance &&
  Math.abs(a.width - b.width) <= tolerance &&
  Math.abs(a.height - b.height) <= tolerance;

const waitForStableRect = async (el, { maxFrames = 30, stableFrames = 3 } = {}) => {
  let previousRect = null;
  let stableCount = 0;

  for (let i = 0; i < maxFrames; i += 1) {
    await waitForNextFrame();

    if (!el || !el.isConnected) return null;

    const rect = getRect(el);

    if (!rect.width || !rect.height) {
      stableCount = 0;
      previousRect = rect;
      continue;
    }

    if (previousRect && rectsMatch(previousRect, rect)) {
      stableCount += 1;
      if (stableCount >= stableFrames) {
        return rect;
      }
    } else {
      stableCount = 0;
    }

    previousRect = rect;
  }

  return el && el.isConnected ? getRect(el) : null;
};

const waitForImageReady = async (el) => {
  if (!(el instanceof HTMLImageElement)) return;

  if (el.complete && el.naturalWidth > 0) {
    if (typeof el.decode === 'function') {
      try {
        await el.decode();
      } catch {}
    }
    return;
  }

  await new Promise((resolve) => {
    const done = () => {
      el.removeEventListener('load', done);
      el.removeEventListener('error', done);
      resolve();
    };

    el.addEventListener('load', done, { once: true });
    el.addEventListener('error', done, { once: true });
  });

  if (typeof el.decode === 'function') {
    try {
      await el.decode();
    } catch {}
  }
};

const createClone = ({ src, fromRect, fromStyle, zIndex }) => {
  const clone = document.createElement('img');
  clone.src = src;
  clone.alt = '';
  clone.setAttribute('aria-hidden', 'true');
  clone.style.position = 'fixed';
  clone.style.left = `${fromRect.left}px`;
  clone.style.top = `${fromRect.top}px`;
  clone.style.width = `${fromRect.width}px`;
  clone.style.height = `${fromRect.height}px`;
  clone.style.objectFit = fromStyle.objectFit || 'contain';
  clone.style.pointerEvents = 'none';
  clone.style.zIndex = String(zIndex);
  clone.style.background = fromStyle.backgroundColor || '#f7f7f7';
  clone.style.borderRadius = fromStyle.borderRadius || '0px';
  clone.style.boxSizing = fromStyle.boxSizing || 'border-box';
  clone.style.transformOrigin = 'center center';
  clone.style.willChange = 'left, top, width, height, opacity, border-radius';
  clone.style.opacity = '0';
  document.body.appendChild(clone);
  return clone;
};

export const startProductImageTransition = async ({
  src,
  fromElement,
  toElementGetter,
  duration = 750,
  minTargetTop = 0,
  zIndex = 999999
}) => {
  if (!src || !fromElement) return;

  if (activeAnimation) {
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    activeClone.remove();
    activeClone = null;
  }

  const fromRect = getRect(fromElement);

  if (!fromRect.width || !fromRect.height) {
    return;
  }

  const fromStyle = window.getComputedStyle(fromElement);

  const clone = createClone({
    src,
    fromRect,
    fromStyle,
    zIndex
  });

  activeClone = clone;

  const toElement = await waitForElement(toElementGetter);

  if (!toElement) {
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  if (!toElement.isConnected) {
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  await waitForImageReady(toElement);

  const stableRect = await waitForStableRect(toElement, {
    maxFrames: 30,
    stableFrames: 3
  });

  if (!stableRect || !stableRect.width || !stableRect.height) {
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  const currentFromRect = getRect(fromElement);

  if (!currentFromRect.width || !currentFromRect.height) {
    clone.remove();
    if (activeClone === clone) activeClone = null;
    return;
  }

  clone.style.left = `${currentFromRect.left}px`;
  clone.style.top = `${currentFromRect.top}px`;
  clone.style.width = `${currentFromRect.width}px`;
  clone.style.height = `${currentFromRect.height}px`;
  clone.style.opacity = '1';

  fromElement.style.opacity = '0';
  toElement.style.opacity = '0';

  const toStyle = window.getComputedStyle(toElement);

  const toRect = {
    left: stableRect.left,
    top: Math.max(stableRect.top, minTargetTop),
    width: stableRect.width,
    height: stableRect.height
  };

  clone.getBoundingClientRect();

  const animation = clone.animate(
    [
      {
        left: `${currentFromRect.left}px`,
        top: `${currentFromRect.top}px`,
        width: `${currentFromRect.width}px`,
        height: `${currentFromRect.height}px`,
        borderRadius: fromStyle.borderRadius,
        opacity: 1
      },
      {
        left: `${toRect.left}px`,
        top: `${toRect.top}px`,
        width: `${toRect.width}px`,
        height: `${toRect.height}px`,
        borderRadius: toStyle.borderRadius,
        opacity: 1
      }
    ],
    {
      duration,
      easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
      fill: 'forwards'
    }
  );

  activeAnimation = animation;

  const cleanup = () => {
    toElement.style.opacity = '';
    fromElement.style.opacity = '';

    clone.remove();

    if (activeClone === clone) {
      activeClone = null;
    }

    if (activeAnimation === animation) {
      activeAnimation = null;
    }
  };

  animation.addEventListener('finish', cleanup, { once: true });
  animation.addEventListener('cancel', cleanup, { once: true });
};

export const clearProductImageTransitionClone = () => {
  if (activeAnimation) {
    activeAnimation.cancel();
    activeAnimation = null;
  }

  if (activeClone) {
    activeClone.remove();
    activeClone = null;
  }
};

  useEffect(() => {
    const handlePopState = () => {};

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const debugScroll = () => {};

    window.addEventListener("scroll", debugScroll);

    return () => window.removeEventListener("scroll", debugScroll);
  }, []);

  useEffect(() => {
    const logNow = () => {};

    logNow();

    requestAnimationFrame(() => {
      logNow();
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        logNow();
      });
    });

    window.addEventListener("load", () => logNow());
    window.addEventListener("pageshow", () => logNow());

    setTimeout(() => logNow(), 100);
    setTimeout(() => logNow(), 500);
    setTimeout(() => logNow(), 1000);
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