import { createContext } from 'react';

export const MenuContext = createContext({
  isMenuOpen: false,
  setIsMenuOpen: () => {},
  showProductsLoader: false,
  setShowProductsLoader: () => {}
});