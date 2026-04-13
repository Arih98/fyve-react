import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    console.log('[AUTH] refreshUser() called');

    try {
      const data = await getCurrentUser();
      console.log('[AUTH] /me response:', data);

      setUser(data.user || null);

      if (data.user) {
        console.log('[AUTH] User is logged in:', data.user);
      } else {
        console.log('[AUTH] No user found (NOT logged in)');
      }
    } catch (err) {
      console.error('[AUTH] Error fetching user:', err);
      setUser(null);
    } finally {
      setAuthLoading(false);
      console.log('[AUTH] authLoading set to false');
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (values) => {
    console.log('[AUTH] login() called with:', values);

    const data = await loginUser(values);

    console.log('[AUTH] login response:', data);

    setUser(data.user || null);

    return data;
  };

  const signup = async (values) => {
    console.log('[AUTH] signup() called with:', values);

    const data = await registerUser(values);

    console.log('[AUTH] signup response:', data);

    setUser(data.user || null);

    return data;
  };

  const logout = async () => {
    console.log('[AUTH] logout() called');

    await logoutUser();

    setUser(null);

    console.log('[AUTH] user cleared after logout');
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