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
<svg className="footer-fyve-svg" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-label="FYVE">
  <text x="-20" y="145" textLength="1040" lengthAdjust="spacingAndGlyphs">FYVE</text>
</svg>
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

        <form className="footer-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? '...' : 'Submit'}
          </button>
        </form>

        {message && <span className="footer-form-message">{message}</span>}
      </div>
    </footer>
  )
}

export default Footer