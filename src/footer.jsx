import React, { useState } from 'react'
import './Footer.css'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) return

    setSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('https://fyvelondon.com/wp-json/fyve/v1/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      setMessage(data.message || 'Done')

      if (response.ok) {
        setEmail('')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="footer">
<div className="footer-brand">
  <div className="footer-logo-wrap">
    <img className="footer-fyve-logo" src="/assets/FYVE-WORDMARK.svg" alt="FYVE" />
  </div>
  <span className="footer-london">LONDON</span>
</div>

      <div className="footer-links">
  <div className="footer-link-row">
  <span className="footer-heading">Company</span>

  <div className="footer-link-items">
    <a href="/our-story">Our Story</a>
    <a href="/lookbook">Lookbook</a>
    <a href="/faq">FAQ</a>
  </div>
</div>

<div className="footer-link-row">
  <span className="footer-heading">Shop</span>

  <div className="footer-link-items">
    <a href="/products?category=boy">Boy</a>
    <a href="/products?category=girl">Girl</a>
    <a href="/products?category=baby">Baby</a>
  </div>
</div>

<div className="footer-link-row">
  <span className="footer-heading">Store Policies</span>

  <div className="footer-link-items">
    <a href="/returns-policy">Return Policy</a>
    <a href="/shipping-policy">Shipping Policy</a>
  </div>
</div>

  <div className="footer-link-row">
    <span className="footer-heading">Stay updated</span>

    <div className="footer-link-items footer-stay-updated">
<a
  className="footer-instagram-link"
  href="https://www.instagram.com/fyvelondon/"
  target="_blank"
  rel="noopener noreferrer"
>
  <span>Follow us on</span>
  <img src="/assets/InstagramLogo.svg" alt="Instagram" />
</a>

      <div className="footer-newsletter">
  <p className="footer-newsletter-text">
    Receive information about new collections, exclusive releases and FYVE updates.
  </p>

  <form className="footer-form" onSubmit={handleSubmit}>
    <div className="footer-input-wrap">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? '...' : 'Send'}
      </button>
    </div>
  </form>
</div>

      {message && <span className="footer-form-message">{message}</span>}
    </div>
  </div>
</div>
    </footer>
  )
}

export default Footer