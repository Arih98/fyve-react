import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span className="footer-fyve">FYVE</span>
        <span className="footer-london">LONDON</span>
      </div>

      <div className="footer-links">
  <span className="footer-heading">Quick links:</span>

  <a href="/faq">FAQ</a>
  <a href="/returns">Return Policy</a>
  <a href="mailto:hello@fyvelondon.com">hello@fyvelondon.com</a>

  <span className="footer-heading">Stay updated:</span>

  <a href="https://www.instagram.com/fyvelondon/" target="_blank" rel="noopener noreferrer">
    Instagram
  </a>
</div>
    </footer>
  )
}

export default Footer