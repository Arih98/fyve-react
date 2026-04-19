import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-top">
          <div className="footer-brand">
            <h2>FYVE</h2>
            <p>Comfortably Modern, Distinctly British</p>
          </div>

          <div className="footer-links">
            <div>
              <h4>Shop</h4>
              <Link to="/shop">All Products</Link>
              <Link to="/collections">Collections</Link>
              <Link to="/new">New In</Link>
            </div>

            <div>
              <h4>Help</h4>
              <Link to="/contact">Contact</Link>
              <Link to="/shipping">Shipping</Link>
              <Link to="/returns">Returns</Link>
            </div>

            <div>
              <h4>Account</h4>
              <Link to="/account">My Account</Link>
              <Link to="/login">Login</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FYVE London</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}