import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './ReturnConfirmation.css'

const API_BASE = 'https://fyvelondon.com'

export default function ReturnConfirmation() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id') || searchParams.get('order')
const token = searchParams.get('token') || ''
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')

  useEffect(() => {
if (!orderId || !token) {
  setStatus('error')
  setError('Missing return details')
  return
}

    let active = true
    let timeoutId = null

    const poll = async () => {
      try {
const response = await fetch(`${API_BASE}/wp-json/fyve/v1/return-status?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`, {
  method: 'GET',
  credentials: 'include'
})

        const data = await response.json()

        if (!active) return

        if (data?.ok && data?.done) {
          setStatus('done')
          return
        }

        setStatus('processing')
        timeoutId = window.setTimeout(poll, 3000)
      } catch {
        if (!active) return
        setStatus('processing')
        timeoutId = window.setTimeout(poll, 5000)
      }
    }

    poll()

    return () => {
      active = false
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [orderId, token])

  return (
    <main className="return-confirmation-page">
      <section className="return-confirmation-card">
        {status === 'checking' && (
          <>
            <h1>Checking your return</h1>
            <p>Please wait while we check your return status.</p>
          </>
        )}

        {status === 'processing' && (
          <>
            <h1>Preparing your return label</h1>
            <p>Your payment was received. We are preparing your return label now.</p>
            <p className="return-confirmation-muted">This page will update automatically.</p>
          </>
        )}

        {status === 'done' && (
          <>
            <h1>Return initiated</h1>
            <p>Your return label has been created and emailed to you.</p>
            <p className="return-confirmation-muted">Please check your inbox and spam folder.</p>
            <Link to="/" className="return-confirmation-button">Continue shopping</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1>Return not found</h1>
            <p>{error || 'We could not find this return.'}</p>
            <Link to="/returns" className="return-confirmation-button">Back to returns</Link>
          </>
        )}
      </section>
    </main>
  )
}