import React, { useContext, useEffect, useRef, useState } from 'react'
import { CartContext } from '../CartContext'
import {
  getCheckoutPrefill,
  getCheckoutData,
  updateCheckoutCustomer,
  selectShippingRate
} from '../api/checkout'
import { formatWooMoney } from '../utils/formatMoney'
import './Checkout.css'

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
  const { cart, cartItems, loading: cartLoading, refreshCart } = useContext(CartContext)

  const [checkoutData, setCheckoutData] = useState(null)
  const [shippingRatesLoading, setShippingRatesLoading] = useState(false)
  const [selectedShippingRate, setSelectedShippingRate] = useState('')

  useEffect(() => {
  if (!cartItems?.length) return

  const billingReady =
  billing.country.trim() &&
  billing.postcode.trim()

const shippingReady = useSeparateShipping
  ? shipping.country.trim() && shipping.postcode.trim()
  : billing.country.trim() && billing.postcode.trim()

if (!billingReady || !shippingReady) return

  const timeout = setTimeout(async () => {
    try {
      setShippingRatesLoading(true)

      const payload = {
        billing_address: {
          first_name: billing.first_name,
          last_name: billing.last_name,
          company: billing.company,
          address_1: billing.address_1,
          address_2: billing.address_2,
          city: billing.city,
          state: billing.state,
          postcode: billing.postcode,
          country: billing.country,
          email: contact.email,
          phone: contact.phone
        },
        shipping_address: useSeparateShipping
          ? {
              first_name: shipping.first_name,
              last_name: shipping.last_name,
              company: shipping.company,
              address_1: shipping.address_1,
              address_2: shipping.address_2,
              city: shipping.city,
              state: shipping.state,
              postcode: shipping.postcode,
              country: shipping.country
            }
          : {
              first_name: billing.first_name,
              last_name: billing.last_name,
              company: billing.company,
              address_1: billing.address_1,
              address_2: billing.address_2,
              city: billing.city,
              state: billing.state,
              postcode: billing.postcode,
              country: billing.country
            }
      }

      await updateCheckoutCustomer(payload)
      await refreshCart({ silent: true })
      const nextCheckoutData = await getCheckoutData().catch(() => null)

      if (nextCheckoutData) {
        setCheckoutData(nextCheckoutData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setShippingRatesLoading(false)
    }
  }, 400)

  return () => clearTimeout(timeout)
}, [
  billing,
  shipping,
  contact,
  useSeparateShipping,
  refreshCart
])

  useEffect(() => {
  let active = true

  async function loadCheckout() {
    try {
      setLoading(true)
      setError('')

      const prefillData = await getCheckoutPrefill().catch(() => null)

      const checkoutResponse = await getCheckoutData().catch(() => null)

      if (checkoutResponse) {
  setCheckoutData(checkoutResponse)
}

      if (!active) return

      if (prefillData && !hasPrefilledRef.current) {
        const prefill = prefillData.prefill || prefillData

        setContact((prev) => ({
          ...prev,
          email: prev.email || prefill?.billing?.email || '',
          phone: prev.phone || prefill?.billing?.phone || ''
        }))

        setBilling((prev) => mergeEmptyFields(prev, prefill?.billing || {}))
        setShipping((prev) => mergeEmptyFields(prev, prefill?.shipping || {}))

        const hasShippingPrefill = Object.values(prefill?.shipping || {}).some(Boolean)

if (hasShippingPrefill) {
  setUseSeparateShipping(true)
}

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

if (loading || cartLoading) {
  return <div>Loading checkout...</div>
}

  if (error) {
    return <div>{error}</div>
  }

  if (!cartItems?.length) {
  return <div>Your cart is empty.</div>
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

    {cartItems.map((item) => {
      const imageSrc =
        item.images?.[0]?.thumbnail ||
        item.images?.[0]?.src ||
        '/api/Uploads/fallback-image.png'

      return (
        <div key={item.key} className="checkout-summary-item">
          <div className="checkout-summary-item-main">
            <img
              src={imageSrc}
              alt={item.name}
              className="checkout-summary-item-image"
            />
            <div className="checkout-summary-item-info">
              <div>{item.name}</div>
              <div>Qty: {item.quantity}</div>
            </div>
          </div>

          <div>{formatWooMoney(item.totals?.line_total, cart?.totals)}</div>
        </div>
      )
    })}

    <div className="checkout-summary-totals">
  <div className="checkout-summary-row checkout-summary-coupon">
    <span>Coupon code</span>
    <button type="button" className="checkout-apply-button">Apply</button>
  </div>

  <div className="checkout-summary-row">
    <span>Subtotal</span>
    <span>{formatWooMoney(cart?.totals?.total_items, cart?.totals)}</span>
  </div>

  <div className="checkout-summary-row checkout-summary-shipment">
    <span>Shipment</span>
    <div className="checkout-summary-shipping-value">
      {(cart?.shipping_rates?.[0]?.shipping_rates?.[0]?.name) || 'Free shipping'}
    </div>
  </div>

  <div className="checkout-summary-row">
    <span>Tax</span>
    <span>{formatWooMoney(cart?.totals?.total_tax, cart?.totals)}</span>
  </div>

  <div className="checkout-summary-row checkout-summary-total">
    <span>Total</span>
    <span>{formatWooMoney(cart?.totals?.total_price, cart?.totals)}</span>
  </div>
</div>
  </section>
</aside>
    </div>
  )
}