import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const AccountTabs = () => {
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const displayName = user?.first_name || user?.username || 'User';
  const greeting = getGreeting();

  return (
    <>
      <div className="account-page-header account-global-header">
        {authLoading ? (
          <>
            <div className="account-skeleton account-skeleton-title"></div>
            <div className="account-skeleton account-skeleton-button"></div>
          </>
        ) : user ? (
          <>
            <div>
              <h1 className="account-page-title">
                {greeting}, {displayName}
              </h1>
            </div>

            <button className="account-logout-button account-global-logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>

      <nav className="account-tabs" aria-label="Account navigation">
        <NavLink to="/account" end className={({ isActive }) => `account-tab${isActive ? ' is-active' : ''}`}>
          Account
        </NavLink>

        <NavLink to="/account/orders" className={({ isActive }) => `account-tab${isActive ? ' is-active' : ''}`}>
          Orders
        </NavLink>

        <NavLink to="/account/addresses" className={({ isActive }) => `account-tab${isActive ? ' is-active' : ''}`}>
          Profile
        </NavLink>
      </nav>
    </>
  );
};

export default AccountTabs;