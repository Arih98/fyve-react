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
        <div className="footer-column">
          <h4>Quick links</h4>
          <a href="/faq">FAQ</a>
          <a href="/returns">Return Policy</a>
          <a href="mailto:hello@fyvelondon.com">hello@fyvelondon.com</a>
        </div>

        <div className="footer-column">
          <h4>Stay updated</h4>
          <a href="https://www.instagram.com/fyvelondon/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer