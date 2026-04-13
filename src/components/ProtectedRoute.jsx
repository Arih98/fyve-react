import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  console.log('[PROTECTED ROUTE]', {
    user,
    authLoading
  });

  if (authLoading) {
    return null;
  }

  if (!user) {
    console.log('[PROTECTED ROUTE] Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('[PROTECTED ROUTE] Access granted');

  return children;
};

export default ProtectedRoute;