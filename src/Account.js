import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const Account = () => {
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">My Account</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Welcome, {user.first_name || user.username || 'User'}
          </h3>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-600 mb-2"><strong>Email:</strong> {user.email}</p>
        <p className="text-gray-600 mb-2"><strong>First name:</strong> {user.first_name || '-'}</p>
        <p className="text-gray-600 mb-2"><strong>Last name:</strong> {user.last_name || '-'}</p>
        <p className="text-gray-600"><strong>Username:</strong> {user.username}</p>
      </div>
    </div>
  );
};

export default Account;