import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SharedTransitionContext = createContext(null);

const sameRect = (a, b) => {
  if (!a || !b) return false;
  return (
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height
  );
};

export const SharedTransitionProvider = ({ children }) => {
  const [transition, setTransition] = useState(null);

  const beginTransition = useCallback((payload) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setTransition({
      id,
      ...payload,
      destinationRect: null
    });
    return id;
  }, []);

  const registerDestination = useCallback((id, destinationRect) => {
    setTransition((current) => {
      if (!current || current.id !== id) return current;
      if (sameRect(current.destinationRect, destinationRect)) return current;

      return {
        ...current,
        destinationRect
      };
    });
  }, []);

  const clearTransition = useCallback((id) => {
    setTransition((current) => {
      if (!current) return current;
      if (id && current.id !== id) return current;
      return null;
    });
  }, []);

  const value = useMemo(() => ({
    transition,
    beginTransition,
    registerDestination,
    clearTransition
  }), [transition, beginTransition, registerDestination, clearTransition]);

  return (
    <SharedTransitionContext.Provider value={value}>
      {children}
    </SharedTransitionContext.Provider>
  );
};

export const useSharedTransition = () => {
  const context = useContext(SharedTransitionContext);
  if (!context) {
    throw new Error('useSharedTransition must be used inside SharedTransitionProvider');
  }
  return context;
};