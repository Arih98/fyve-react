import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const AccountTabs = () => {
  const { user, authLoading } = useAuth();

  const displayName = user?.first_name || user?.username || 'User';
  const greeting = getGreeting();

  return (
    <>
      <div className="account-page-header account-global-header">
        {authLoading ? (
          <div className="account-skeleton account-skeleton-title"></div>
        ) : user ? (
          <div>
            <h1 className="account-page-title">
              {greeting}, {displayName}
            </h1>
          </div>
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