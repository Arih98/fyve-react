import React from 'react';
import { NavLink } from 'react-router-dom';

const AccountTabs = () => {
  return (
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
  );
};

export default AccountTabs;