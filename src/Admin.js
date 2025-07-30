import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductEditor from './ProductEditor';

const Admin = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'admin') {
      // Verify token with admin_login endpoint
      fetch('/api/admin_login.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            setIsAdminLoggedIn(true);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            setError(data.error || 'Invalid admin session');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setError('Failed to verify admin session');
        });
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setIsAdminLoggedIn(true);
        setError(null);
        setLoginData({ email: '', password: '' });
      } else {
        setError(data.error || 'Admin login failed');
      }
    } catch (err) {
      setError('Admin login failed: ' + err.message);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      {isAdminLoggedIn ? (
        <ProductEditor />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Admin Login</h2>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <form onSubmit={handleAdminLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;