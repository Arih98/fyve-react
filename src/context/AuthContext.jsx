import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setAuthLoading(true);

    try {
      const data = await getCurrentUser();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    setAuthLoading(true);

    try {
      const data = await loginUser(email, password);
      setUser(data.user || null);
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (values) => {
    setAuthLoading(true);

    try {
      const data = await registerUser(values);
      setUser(data.user || null);
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);

    try {
      await logoutUser();
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        signup,
        logout,
        refreshUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);