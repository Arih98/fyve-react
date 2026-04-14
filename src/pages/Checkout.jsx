import React, { useEffect, useRef, useState } from 'react'
import { getCheckoutCart, getCheckoutPrefill } from '../api/checkout'

function mergeEmptyFields(current, incoming) {
  const next = { ...current }

  Object.keys(incoming || {}).forEach((key) => {
    if (!current[key]) {
      next[key] = incoming[key] || ''
    }
  })

  return next
}

export default function Checkout() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cart, setCart] = useState(null)

  const [contact, setContact] = useState({
    email: '',
    phone: ''
  })

  const [billing, setBilling] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: ''
  })

  const [useSeparateShipping, setUseSeparateShipping] = useState(false)

  const [shipping, setShipping] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: ''
  })

  const hasPrefilledRef = useRef(false)

  useEffect(() => {
    let active = true

    async function loadCheckout() {
      try {
        setLoading(true)
        setError('')

        const [cartData, prefillData] = await Promise.allSettled([
          getCheckoutCart(),
          getCheckoutPrefill()
        ])

        if (!active) return

        if (cartData.status === 'fulfilled') {
          setCart(cartData.value.cart || cartData.value)
        } else {
          throw new Error(cartData.reason?.message || 'Failed to load cart')
        }

        if (prefillData.status === 'fulfilled' && !hasPrefilledRef.current) {
          const prefill = prefillData.value.prefill || prefillData.value

          setContact((prev) => ({
            ...prev,
            email: prev.email || prefill?.billing?.email || '',
            phone: prev.phone || prefill?.billing?.phone || ''
          }))

          setBilling((prev) => mergeEmptyFields(prev, prefill?.billing || {}))
          setShipping((prev) => mergeEmptyFields(prev, prefill?.shipping || {}))

          hasPrefilledRef.current = true
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load checkout')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadCheckout()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <div>Loading checkout...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="checkout-page">
      <div className="checkout-main">
        <section className="checkout-section">
          <h1>Checkout</h1>
        </section>

        <section className="checkout-section">
          <h2>Contact</h2>

          <input
            type="email"
            placeholder="Email"
            value={contact.email}
            onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Phone"
            value={contact.phone}
            onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </section>

        <section className="checkout-section">
          <h2>Billing address</h2>

          <input
            type="text"
            placeholder="First name"
            value={billing.first_name}
            onChange={(e) => setBilling((prev) => ({ ...prev, first_name: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Last name"
            value={billing.last_name}
            onChange={(e) => setBilling((prev) => ({ ...prev, last_name: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Company"
            value={billing.company}
            onChange={(e) => setBilling((prev) => ({ ...prev, company: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Address line 1"
            value={billing.address_1}
            onChange={(e) => setBilling((prev) => ({ ...prev, address_1: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Address line 2"
            value={billing.address_2}
            onChange={(e) => setBilling((prev) => ({ ...prev, address_2: e.target.value }))}
          />

          <input
            type="text"
            placeholder="City"
            value={billing.city}
            onChange={(e) => setBilling((prev) => ({ ...prev, city: e.target.value }))}
          />

          <input
            type="text"
            placeholder="State / County"
            value={billing.state}
            onChange={(e) => setBilling((prev) => ({ ...prev, state: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Postcode"
            value={billing.postcode}
            onChange={(e) => setBilling((prev) => ({ ...prev, postcode: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Country"
            value={billing.country}
            onChange={(e) => setBilling((prev) => ({ ...prev, country: e.target.value }))}
          />
        </section>

        <section className="checkout-section">
          <label>
            <input
              type="checkbox"
              checked={useSeparateShipping}
              onChange={(e) => setUseSeparateShipping(e.target.checked)}
            />
            Ship to a different address
          </label>
        </section>

        {useSeparateShipping && (
          <section className="checkout-section">
            <h2>Shipping address</h2>

            <input
              type="text"
              placeholder="First name"
              value={shipping.first_name}
              onChange={(e) => setShipping((prev) => ({ ...prev, first_name: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Last name"
              value={shipping.last_name}
              onChange={(e) => setShipping((prev) => ({ ...prev, last_name: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Company"
              value={shipping.company}
              onChange={(e) => setShipping((prev) => ({ ...prev, company: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Address line 1"
              value={shipping.address_1}
              onChange={(e) => setShipping((prev) => ({ ...prev, address_1: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Address line 2"
              value={shipping.address_2}
              onChange={(e) => setShipping((prev) => ({ ...prev, address_2: e.target.value }))}
            />

            <input
              type="text"
              placeholder="City"
              value={shipping.city}
              onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))}
            />

            <input
              type="text"
              placeholder="State / County"
              value={shipping.state}
              onChange={(e) => setShipping((prev) => ({ ...prev, state: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Postcode"
              value={shipping.postcode}
              onChange={(e) => setShipping((prev) => ({ ...prev, postcode: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Country"
              value={shipping.country}
              onChange={(e) => setShipping((prev) => ({ ...prev, country: e.target.value }))}
            />
          </section>
        )}
      </div>

      <aside className="checkout-sidebar">
        <section className="checkout-section">
          <h2>Order summary</h2>

          {!cart?.items?.length ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.items.map((item) => (
                <div key={item.key || item.id} className="checkout-summary-item">
                  <div>{item.name}</div>
                  <div>Qty: {item.quantity}</div>
                  <div>{item.total}</div>
                </div>
              ))}

              <div className="checkout-summary-totals">
                <div>Subtotal: {cart.subtotal}</div>
                <div>Shipping: {cart.shipping_total}</div>
                <div>Total: {cart.total}</div>
              </div>
            </>
          )}
        </section>
      </aside>
    </div>
  )
}