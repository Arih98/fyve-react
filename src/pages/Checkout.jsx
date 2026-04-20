import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { CartContext } from '../CartContext'
import {
  getCheckoutPrefill,
  getCheckoutData,
  updateCheckoutCustomer,
  createRevolutOrder,
  clearCheckoutCart,
  updateRevolutOrderDetails,
  applyCoupon,
  removeCoupon
} from '../api/checkout'
import { formatWooMoney } from '../utils/formatMoney'
import './Checkout.css'
import RevolutCheckout from '@revolut/checkout'

function mergeEmptyFields(current, incoming) {
  const next = { ...current }

  Object.keys(incoming || {}).forEach((key) => {
    if (!current[key]) {
      next[key] = incoming[key] || ''
    }
  })

  return next
}

function decodeHtmlEntities(value) {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = value || ''
  return textarea.value
}

const CHECKOUT_DRAFT_STORAGE_KEY = window.location.hostname === 'dev.fyvelondon.com'
  ? 'fyve_checkout_draft_dev_v2'
  : 'fyve_checkout_draft_live_v2'

function normalizeUsState(value) {
  const input = String(value || '').trim()
  const upper = input.toUpperCase()

  const map = {
    ALABAMA: 'AL',
    ALASKA: 'AK',
    ARIZONA: 'AZ',
    ARKANSAS: 'AR',
    CALIFORNIA: 'CA',
    COLORADO: 'CO',
    CONNECTICUT: 'CT',
    DELAWARE: 'DE',
    FLORIDA: 'FL',
    GEORGIA: 'GA',
    HAWAII: 'HI',
    IDAHO: 'ID',
    ILLINOIS: 'IL',
    INDIANA: 'IN',
    IOWA: 'IA',
    KANSAS: 'KS',
    KENTUCKY: 'KY',
    LOUISIANA: 'LA',
    MAINE: 'ME',
    MARYLAND: 'MD',
    MASSACHUSETTS: 'MA',
    MICHIGAN: 'MI',
    MINNESOTA: 'MN',
    MISSISSIPPI: 'MS',
    MISSOURI: 'MO',
    MONTANA: 'MT',
    NEBRASKA: 'NE',
    NEVADA: 'NV',
    'NEW HAMPSHIRE': 'NH',
    'NEW JERSEY': 'NJ',
    'NEW MEXICO': 'NM',
    'NEW YORK': 'NY',
    'NORTH CAROLINA': 'NC',
    'NORTH DAKOTA': 'ND',
    OHIO: 'OH',
    OKLAHOMA: 'OK',
    OREGON: 'OR',
    PENNSYLVANIA: 'PA',
    'RHODE ISLAND': 'RI',
    'SOUTH CAROLINA': 'SC',
    'SOUTH DAKOTA': 'SD',
    TENNESSEE: 'TN',
    TEXAS: 'TX',
    UTAH: 'UT',
    VERMONT: 'VT',
    VIRGINIA: 'VA',
    WASHINGTON: 'WA',
    'WEST VIRGINIA': 'WV',
    WISCONSIN: 'WI',
    WYOMING: 'WY',
    'DISTRICT OF COLUMBIA': 'DC'
  }

  if (map[upper]) return map[upper]
  if (/^[A-Z]{2}$/.test(upper)) return upper
  return input
}

function getCheckoutValidationErrors({ contact, billing, shipping, useSeparateShipping }) {
  const errors = {}

  if (!billing.first_name.trim()) errors.billing_first_name = 'Please enter your first name'
  if (!billing.last_name.trim()) errors.billing_last_name = 'Please enter your last name'
  if (!billing.address_1.trim()) errors.billing_address_1 = 'Please enter your street address'
  if (!billing.city.trim()) errors.billing_city = 'Please enter your city'
  if (!billing.state.trim()) errors.billing_state = 'Please enter your state'
  if (!billing.postcode.trim()) errors.billing_postcode = 'Please enter your ZIP code'

  if (!contact.email.trim()) {
    errors.contact_email = 'Please enter your email address'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
    errors.contact_email = 'Please enter a valid email address'
  }

  if (useSeparateShipping) {
    if (!shipping.first_name.trim()) errors.shipping_first_name = 'Please enter your shipping first name'
    if (!shipping.last_name.trim()) errors.shipping_last_name = 'Please enter your shipping last name'
    if (!shipping.address_1.trim()) errors.shipping_address_1 = 'Please enter your shipping street address'
    if (!shipping.city.trim()) errors.shipping_city = 'Please enter your shipping city'
    if (!shipping.state.trim()) errors.shipping_state = 'Please enter your shipping state'
    if (!shipping.postcode.trim()) errors.shipping_postcode = 'Please enter your shipping ZIP code'
  }

  return errors
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
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US'
  })

  const [useSeparateShipping, setUseSeparateShipping] = useState(false)

  const [shipping, setShipping] = useState({
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'US'
  })

  const [checkoutData, setCheckoutData] = useState(null)
  const [draftOrderId, setDraftOrderId] = useState(null)
  const [draftOrderKey, setDraftOrderKey] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [revolutPublicKey, setRevolutPublicKey] = useState('')
  const [cardReady, setCardReady] = useState(false)
  const [appleGoogleReady, setAppleGoogleReady] = useState(false)
  const [revolutPayReady, setRevolutPayReady] = useState(false)
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  const [isFinalizingOrder, setIsFinalizingOrder] = useState(false)

  const hasPrefilledRef = useRef(false)

  const cardContainerRef = useRef(null)
  const appleGoogleContainerRef = useRef(null)
  const revolutPayContainerRef = useRef(null)

  const cardFieldInstanceRef = useRef(null)
  const paymentRequestInstanceRef = useRef(null)
  const revolutPayInstanceRef = useRef(null)

  const latestWooOrderIdRef = useRef(null)
  const currentRevolutModeRef = useRef(window.location.hostname === 'dev.fyvelondon.com' ? 'sandbox' : 'prod')
  const paymentSnapshotRef = useRef(null)
  const totalAmountMinorRef = useRef(0)
  const currencyRef = useRef('GBP')

  const { cart, cartItems, loading: cartLoading, refreshCart } = useContext(CartContext)

  const clearMountedPaymentMethods = useCallback(() => {
  setCardReady(false)
  setAppleGoogleReady(false)
  setRevolutPayReady(false)

  if (cardFieldInstanceRef.current) {
    cardFieldInstanceRef.current.destroy()
    cardFieldInstanceRef.current = null
  }

  if (paymentRequestInstanceRef.current) {
    paymentRequestInstanceRef.current.destroy()
    paymentRequestInstanceRef.current = null
  }

  if (revolutPayInstanceRef.current) {
    revolutPayInstanceRef.current.destroy()
    revolutPayInstanceRef.current = null
  }
}, [])

const finalizeOrderBeforeRedirect = useCallback(async () => {
  const wooOrderId = latestWooOrderIdRef.current

  if (!wooOrderId) {
    throw new Error('Payment succeeded but order id is missing')
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`https://fyvelondon.com/wp-json/fyve-checkout/v1/order-status/${wooOrderId}`, {
      method: 'GET',
      credentials: 'include'
    })

    const raw = await response.text()

    let result = null

    try {
      result = raw ? JSON.parse(raw) : null
    } catch (e) {
      throw new Error(raw || `Request failed with status ${response.status}`)
    }

    if (!response.ok) {
      throw new Error(result?.message || `Request failed with status ${response.status}`)
    }

    const nextOrder = result?.order || null
    const paid = Boolean(nextOrder?.is_paid)
    const status = String(nextOrder?.status || '').toLowerCase()

    if (paid || status === 'processing' || status === 'completed') {
      await clearCheckoutCart().catch(() => {})
      await refreshCart({ silent: true }).catch(() => {})
      window.location.href = `/checkout/success?order_id=${encodeURIComponent(wooOrderId)}`
      return
    }

    await sleep(2000)
  }

  const confirmResponse = await fetch(`https://fyvelondon.com/wp-json/fyve-checkout/v1/confirm-revolut-payment/${wooOrderId}`, {
    method: 'POST',
    credentials: 'include'
  })

  const confirmRaw = await confirmResponse.text()

  let confirmResult = null

  try {
    confirmResult = confirmRaw ? JSON.parse(confirmRaw) : null
  } catch (e) {
    throw new Error(confirmRaw || `Request failed with status ${confirmResponse.status}`)
  }

  if (!confirmResponse.ok) {
    throw new Error(confirmResult?.message || `Request failed with status ${confirmResponse.status}`)
  }

  const nextOrder = confirmResult?.order || null
  const confirmed = Boolean(confirmResult?.confirmed || nextOrder?.is_paid)
  const status = String(nextOrder?.status || '').toLowerCase()

  if (confirmed || status === 'processing' || status === 'completed') {
    await clearCheckoutCart().catch(() => {})
    await refreshCart({ silent: true }).catch(() => {})
    window.location.href = `/checkout/success?order_id=${encodeURIComponent(wooOrderId)}`
    return
  }

  throw new Error('Your payment is still being finalised. Please refresh this page in a moment.')
}, [refreshCart])

const initializePaymentMethods = useCallback(async () => {
  setPaymentLoading(true)
  setError('')

  const latestCheckout = await getCheckoutData()
  setCheckoutData(latestCheckout)
  setDraftOrderId(latestCheckout.order_id || null)
  setDraftOrderKey(latestCheckout.order_key || '')

  totalAmountMinorRef.current = Number(latestCheckout?.totals?.total_price || cart?.totals?.total_price || 0)
  currencyRef.current = String(latestCheckout?.totals?.currency_code || cart?.totals?.currency_code || 'GBP').toUpperCase()

  const publicKey = window.location.hostname === 'dev.fyvelondon.com'
    ? 'pk_dET7Wo5zuMrGJQtsyNUP1ia6YV7HmWTK87KxlTiTVrNRpv8W'
    : 'pk_4Vz86AUZwd356oEaE8mTXaymLyMSushzlPa6rx6cKnMQBQOI'

  if (!publicKey) {
    throw new Error('Missing Revolut public API key')
  }

  latestWooOrderIdRef.current = latestCheckout.order_id || null
  setRevolutPublicKey(publicKey)
  setPaymentMethodsOpen(true)
  setPaymentLoading(false)
}, [cart])

  const clearSavedCheckoutDraft = () => {
    localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY)

    setContact({
      email: '',
      phone: ''
    })

    setBilling({
      first_name: '',
      last_name: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'US'
    })

    setShipping({
      first_name: '',
      last_name: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'US'
    })

    setUseSeparateShipping(false)
    setError('')
    setPaymentMethodsOpen(false)
    setRevolutPublicKey('')
    paymentSnapshotRef.current = null
    totalAmountMinorRef.current = 0
    currencyRef.current = 'GBP'
    clearMountedPaymentMethods()
  }

  const createRevolutPaymentOrder = useCallback(async () => {
  const snapshot = paymentSnapshotRef.current

  if (!snapshot) {
    throw new Error('Payment snapshot is missing')
  }

  const latestCheckout = await getCheckoutData()

  const revolutResult = await createRevolutOrder({
    draft_order_id: latestCheckout.order_id || null,
    draft_order_key: latestCheckout.order_key || '',
    validation_mode: 'payment',
    useSeparateShipping: snapshot.useSeparateShipping,
    billing_email: snapshot.contact.email,
    billing_phone: snapshot.contact.phone || '',
    billing_first_name: snapshot.billing.first_name,
    billing_last_name: snapshot.billing.last_name,
    billing_address_1: snapshot.billing.address_1,
    billing_address_2: snapshot.billing.address_2,
    billing_city: snapshot.billing.city,
    billing_state: normalizeUsState(snapshot.billing.state),
    billing_postcode: snapshot.billing.postcode,
    billing_country: snapshot.billing.country,
    shipping_first_name: snapshot.useSeparateShipping ? snapshot.shipping.first_name : snapshot.billing.first_name,
    shipping_last_name: snapshot.useSeparateShipping ? snapshot.shipping.last_name : snapshot.billing.last_name,
    shipping_address_1: snapshot.useSeparateShipping ? snapshot.shipping.address_1 : snapshot.billing.address_1,
    shipping_address_2: snapshot.useSeparateShipping ? snapshot.shipping.address_2 : snapshot.billing.address_2,
    shipping_city: snapshot.useSeparateShipping ? snapshot.shipping.city : snapshot.billing.city,
    shipping_state: snapshot.useSeparateShipping ? normalizeUsState(snapshot.shipping.state) : normalizeUsState(snapshot.billing.state),
    shipping_postcode: snapshot.useSeparateShipping ? snapshot.shipping.postcode : snapshot.billing.postcode,
    shipping_country: snapshot.useSeparateShipping ? snapshot.shipping.country : snapshot.billing.country
  })

  if (!revolutResult?.revolut_order_token) {
    throw new Error('Missing Revolut order token')
  }

  latestWooOrderIdRef.current = revolutResult.wc_order_id || latestCheckout.order_id || null

  return revolutResult
}, [])

  const [fieldErrors, setFieldErrors] = useState({})

const firstNameRef = useRef(null)
const lastNameRef = useRef(null)
const address1Ref = useRef(null)
const cityRef = useRef(null)
const stateRef = useRef(null)
const postcodeRef = useRef(null)
const emailRef = useRef(null)

const shippingFirstNameRef = useRef(null)
const shippingLastNameRef = useRef(null)
const shippingAddress1Ref = useRef(null)
const shippingCityRef = useRef(null)
const shippingStateRef = useRef(null)
const shippingPostcodeRef = useRef(null)

const [couponCode, setCouponCode] = useState('')
const [couponLoading, setCouponLoading] = useState(false)
const [couponMessage, setCouponMessage] = useState('')

const focusFirstInvalidField = useCallback((errors) => {
  const firstKey = Object.keys(errors)[0]

  if (!firstKey) return

  const refMap = {
    billing_first_name: firstNameRef,
    billing_last_name: lastNameRef,
    billing_address_1: address1Ref,
    billing_city: cityRef,
    billing_state: stateRef,
    billing_postcode: postcodeRef,
    contact_email: emailRef,
    shipping_first_name: shippingFirstNameRef,
    shipping_last_name: shippingLastNameRef,
    shipping_address_1: shippingAddress1Ref,
    shipping_city: shippingCityRef,
    shipping_state: shippingStateRef,
    shipping_postcode: shippingPostcodeRef
  }

  const ref = refMap[firstKey]

  if (ref?.current) {
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      ref.current?.focus()
    }, 250)
  }
}, [])

const validateCheckoutBeforePayment = useCallback(() => {
  const errors = getCheckoutValidationErrors({
    contact,
    billing,
    shipping,
    useSeparateShipping
  })

  setFieldErrors(errors)

  if (Object.keys(errors).length > 0) {
    setError('Please complete the required fields')
    focusFirstInvalidField(errors)
    return false
  }

  setError('')
  return true
}, [contact, billing, shipping, useSeparateShipping, focusFirstInvalidField])

const applyServerValidationErrors = useCallback((err) => {
  const fieldErrorsFromServer = err?.field_errors || err?.data?.field_errors || err?.response?.data?.field_errors

  if (fieldErrorsFromServer && typeof fieldErrorsFromServer === 'object') {
    setFieldErrors(fieldErrorsFromServer)
    setError(err?.message || err?.data?.message || 'Please complete the required fields')
    focusFirstInvalidField(fieldErrorsFromServer)
    return true
  }

  return false
}, [focusFirstInvalidField])

  useEffect(() => {
    const draft = {
      contact,
      billing,
      shipping,
      useSeparateShipping
    }

    localStorage.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify(draft))
  }, [contact, billing, shipping, useSeparateShipping])

  useEffect(() => {
  if (loading || cartLoading) return
  if (!cartItems?.length) return
  if (paymentMethodsOpen) return
  if (revolutPublicKey) return

  ;(async () => {
    try {
      await initializePaymentMethods()
    } catch (err) {
      setPaymentLoading(false)
      setError(err.message || 'Failed to prepare payment methods')
    }
  })()
}, [
  loading,
  cartLoading,
  cartItems,
  paymentMethodsOpen,
  revolutPublicKey,
  initializePaymentMethods
])

useEffect(() => {
  paymentSnapshotRef.current = {
    contact: { ...contact },
    billing: { ...billing },
    shipping: { ...shipping },
    useSeparateShipping
  }
}, [contact, billing, shipping, useSeparateShipping])

  useEffect(() => {
    let active = true

    async function loadCheckout() {
      try {
        setLoading(true)
        setError('')

        const savedDraftRaw = localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY)

        if (savedDraftRaw) {
          try {
            const savedDraft = JSON.parse(savedDraftRaw)

            if (savedDraft.contact) {
              setContact((prev) => ({
                ...prev,
                ...savedDraft.contact
              }))
            }

if (savedDraft.billing) {
  setBilling((prev) => ({
    ...prev,
    ...savedDraft.billing
  }))
}

if (savedDraft.shipping) {
  setShipping((prev) => ({
    ...prev,
    ...savedDraft.shipping
  }))
}

            if (typeof savedDraft.useSeparateShipping === 'boolean') {
              setUseSeparateShipping(savedDraft.useSeparateShipping)
            }

          } catch (err) {
            console.error(err)
          }
        }

        const prefillData = await getCheckoutPrefill().catch(() => null)
        const checkoutResponse = await getCheckoutData().catch(() => null)

        if (!active) return

        if (checkoutResponse) {
          setCheckoutData(checkoutResponse)
          setDraftOrderId(checkoutResponse.order_id || null)
          setDraftOrderKey(checkoutResponse.order_key || '')
        }

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

  useEffect(() => {
    if (!paymentMethodsOpen) {
      clearMountedPaymentMethods()
      return
    }

    if (!revolutPublicKey) return
    if (!cardContainerRef.current) return
    if (!appleGoogleContainerRef.current) return
    if (!revolutPayContainerRef.current) return

    let cancelled = false

    const mountMethods = async () => {
      try {
        clearMountedPaymentMethods()

        const mode = currentRevolutModeRef.current
        const snapshot = paymentSnapshotRef.current

        if (!snapshot) {
          throw new Error('Payment snapshot is missing')
        }

        const fullName = `${snapshot.billing.first_name} ${snapshot.billing.last_name}`.trim()

const billingAddress = {
  countryCode: snapshot.billing.country || undefined,
  region: normalizeUsState(snapshot.billing.state) || undefined,
  city: snapshot.billing.city || undefined,
  postcode: snapshot.billing.postcode || undefined,
  streetLine1: snapshot.billing.address_1 || undefined,
  streetLine2: snapshot.billing.address_2 || undefined
}

const shippingAddress = snapshot.useSeparateShipping
  ? {
      countryCode: snapshot.shipping.country || undefined,
      region: normalizeUsState(snapshot.shipping.state) || undefined,
      city: snapshot.shipping.city || undefined,
      postcode: snapshot.shipping.postcode || undefined,
      streetLine1: snapshot.shipping.address_1 || undefined,
      streetLine2: snapshot.shipping.address_2 || undefined
    }
  : billingAddress

        const payments = await RevolutCheckout.payments({
          publicToken: revolutPublicKey,
          locale: 'en',
          mode
        })

        if (cancelled) return

        const cardSession = await createRevolutOrder({
  draft_order_id: draftOrderId || checkoutData?.order_id || null,
  draft_order_key: draftOrderKey || checkoutData?.order_key || '',
  validation_mode: 'mount',
  useSeparateShipping,
  billing_email: contact.email,
  billing_phone: contact.phone || '',
  billing_first_name: billing.first_name,
  billing_last_name: billing.last_name,
  billing_address_1: billing.address_1,
  billing_address_2: billing.address_2,
  billing_city: billing.city,
  billing_state: normalizeUsState(billing.state),
  billing_postcode: billing.postcode,
  billing_country: billing.country,
  shipping_first_name: useSeparateShipping ? shipping.first_name : billing.first_name,
  shipping_last_name: useSeparateShipping ? shipping.last_name : billing.last_name,
  shipping_address_1: useSeparateShipping ? shipping.address_1 : billing.address_1,
  shipping_address_2: useSeparateShipping ? shipping.address_2 : billing.address_2,
  shipping_city: useSeparateShipping ? shipping.city : billing.city,
  shipping_state: useSeparateShipping ? normalizeUsState(shipping.state) : normalizeUsState(billing.state),
  shipping_postcode: useSeparateShipping ? shipping.postcode : billing.postcode,
  shipping_country: useSeparateShipping ? shipping.country : billing.country
})

if (!cardSession?.revolut_order_token) {
  throw new Error('Missing Revolut order token')
}

latestWooOrderIdRef.current = cardSession.wc_order_id || latestWooOrderIdRef.current

const cardCheckout = await RevolutCheckout(cardSession.revolut_order_token, mode)

if (cancelled) return

const cardField = cardCheckout.createCardField({
  target: cardContainerRef.current,
  locale: 'en',
  hidePostcodeField: true,
  name: fullName || undefined,
  email: snapshot.contact.email || undefined,
  phone: snapshot.contact.phone || undefined,
  billingAddress,
  shippingAddress,
onSuccess: async () => {
  try {
    setIsFinalizingOrder(true)
    await finalizeOrderBeforeRedirect()
  } catch (error) {
    setIsFinalizingOrder(false)
    setPaymentLoading(false)
    setError(error?.message || 'Failed to finalise order')
  }
},
  onError: (error) => {
  setPaymentLoading(false)
  setIsFinalizingOrder(false)
  setError(error?.message || 'Card payment failed')
},
onCancel: () => {
  setPaymentLoading(false)
  setIsFinalizingOrder(false)
  setError('Card payment cancelled')
}
})

cardFieldInstanceRef.current = cardField
setCardReady(true)


        const paymentRequestInstance = payments.paymentRequest(appleGoogleContainerRef.current, {
  amount: totalAmountMinorRef.current,
  currency: currencyRef.current,
  createOrder: async () => {
  const live = paymentSnapshotRef.current

  if (!live) {
    throw new Error('Payment snapshot is missing')
  }

  const errors = getCheckoutValidationErrors(live)

  setFieldErrors(errors)

  if (Object.keys(errors).length > 0) {
    setError('Please complete the required fields')
    focusFirstInvalidField(errors)
    throw new Error('Please complete the required fields')
  }

  try {
    await updateCheckoutCustomer({
      billingAddress: {
        first_name: live.billing.first_name,
        last_name: live.billing.last_name,
        address_1: live.billing.address_1,
        address_2: live.billing.address_2,
        city: live.billing.city,
        state: normalizeUsState(live.billing.state),
        postcode: live.billing.postcode,
        country: live.billing.country,
        email: live.contact.email,
        phone: live.contact.phone
      },
      shippingAddress: live.useSeparateShipping
        ? {
            first_name: live.shipping.first_name,
            last_name: live.shipping.last_name,
            address_1: live.shipping.address_1,
            address_2: live.shipping.address_2,
            city: live.shipping.city,
            state: normalizeUsState(live.shipping.state),
            postcode: live.shipping.postcode,
            country: live.shipping.country
          }
        : {
            first_name: live.billing.first_name,
            last_name: live.billing.last_name,
            address_1: live.billing.address_1,
            address_2: live.billing.address_2,
            city: live.billing.city,
            state: normalizeUsState(live.billing.state),
            postcode: live.billing.postcode,
            country: live.billing.country
          }
    })

    const result = await createRevolutPaymentOrder()
    return { publicId: result.revolut_order_token }
  } catch (err) {
    if (applyServerValidationErrors(err)) {
      throw new Error('Please complete the required fields')
    }
    throw err
  }
},
onSuccess: async () => {
  try {
    setIsFinalizingOrder(true)
    await finalizeOrderBeforeRedirect()
  } catch (error) {
    setIsFinalizingOrder(false)
    setPaymentLoading(false)
    setError(error?.message || 'Failed to finalise order')
  }
},
onError: (error) => {
  const message = error?.message || 'Apple Pay / Google Pay payment failed'
  if (message === 'Please complete the required fields') return
  setError(message)
},
  onCancel: () => {
    setError('Apple Pay / Google Pay payment cancelled')
  }
})

        paymentRequestInstanceRef.current = paymentRequestInstance

        const availableMethod = await paymentRequestInstance.canMakePayment()

        if (!cancelled && availableMethod) {
          await paymentRequestInstance.render()
          setAppleGoogleReady(true)
        } else {
          paymentRequestInstance.destroy()
          paymentRequestInstanceRef.current = null
          setAppleGoogleReady(false)
        }

                const revolutPayOptions = {
          currency: currencyRef.current,
          totalAmount: totalAmountMinorRef.current,
          createOrder: async () => {
  const live = paymentSnapshotRef.current

  if (!live) {
    throw new Error('Payment snapshot is missing')
  }

  const errors = getCheckoutValidationErrors(live)

  setFieldErrors(errors)

  if (Object.keys(errors).length > 0) {
    setError('Please complete the required fields')
    focusFirstInvalidField(errors)
    throw new Error('Please complete the required fields')
  }

  try {
    await updateCheckoutCustomer({
      billingAddress: {
        first_name: live.billing.first_name,
        last_name: live.billing.last_name,
        address_1: live.billing.address_1,
        address_2: live.billing.address_2,
        city: live.billing.city,
        state: normalizeUsState(live.billing.state),
        postcode: live.billing.postcode,
        country: live.billing.country,
        email: live.contact.email,
        phone: live.contact.phone
      },
      shippingAddress: live.useSeparateShipping
        ? {
            first_name: live.shipping.first_name,
            last_name: live.shipping.last_name,
            address_1: live.shipping.address_1,
            address_2: live.shipping.address_2,
            city: live.shipping.city,
            state: normalizeUsState(live.shipping.state),
            postcode: live.shipping.postcode,
            country: live.shipping.country
          }
        : {
            first_name: live.billing.first_name,
            last_name: live.billing.last_name,
            address_1: live.billing.address_1,
            address_2: live.billing.address_2,
            city: live.billing.city,
            state: normalizeUsState(live.billing.state),
            postcode: live.billing.postcode,
            country: live.billing.country
          }
    })

    const result = await createRevolutPaymentOrder()
    return { publicId: result.revolut_order_token }
  } catch (err) {
    if (applyServerValidationErrors(err)) {
      throw new Error('Please complete the required fields')
    }
    throw err
  }
},
          customer: {
            name: fullName || undefined,
            email: snapshot.contact.email || undefined,
            phone: snapshot.contact.phone || undefined,
            billingAddress,
            shippingAddress
          },
          mobileRedirectUrls: {
            success: `${window.location.origin}/checkout/success?order_id=${encodeURIComponent(latestWooOrderIdRef.current || '')}`,
            failure: `${window.location.origin}/checkout`,
            cancel: `${window.location.origin}/checkout`
          }
        }

        payments.revolutPay.mount(revolutPayContainerRef.current, revolutPayOptions)
        revolutPayInstanceRef.current = payments.revolutPay
        setRevolutPayReady(true)
        setPaymentLoading(false)

        payments.revolutPay.on('payment', (event) => {
          switch (event?.type) {
case 'success':
  ;(async () => {
    try {
      setIsFinalizingOrder(true)
      await finalizeOrderBeforeRedirect()
    } catch (error) {
      setIsFinalizingOrder(false)
      setPaymentLoading(false)
      setError(error?.message || 'Failed to finalise order')
    }
  })()
  break
case 'error': {
  const message = event?.error?.message || 'Revolut Pay payment failed'
  if (message !== 'Please complete the required fields') {
    setError(message)
  }
  break
}
            case 'cancel':
              setError('Revolut Pay payment cancelled')
              break
            default:
              break
          }
        })
} catch (err) {
  if (!cancelled) {
    setPaymentLoading(false)
    setError(err?.message || 'Failed to load payment methods')
  }
}
    }

    mountMethods()

    return () => {
      cancelled = true
      clearMountedPaymentMethods()
    }
}, [
  paymentMethodsOpen,
  revolutPublicKey,
  clearMountedPaymentMethods,
  createRevolutPaymentOrder,
  applyServerValidationErrors,
  focusFirstInvalidField,
  draftOrderId,
  draftOrderKey,
  checkoutData,
  contact,
  billing,
  shipping,
  useSeparateShipping,
  finalizeOrderBeforeRedirect
])

const handleApplyCoupon = async () => {
  const code = couponCode.trim()

  if (!code) {
    setCouponMessage('Please enter a coupon code')
    return
  }

  try {
    setCouponLoading(true)
    setCouponMessage('')
    setError('')

    await applyCoupon(code)

    const latestCart = await refreshCart({ silent: true }).catch(() => null)
    const latestCheckout = await getCheckoutData().catch(() => null)

    console.log('latestCart after coupon', latestCart)
    console.log('latestCheckout after coupon', latestCheckout)

    if (latestCheckout) {
      setCheckoutData(latestCheckout)
      setDraftOrderId(latestCheckout.order_id || null)
      setDraftOrderKey(latestCheckout.order_key || '')
      totalAmountMinorRef.current = Number(latestCheckout?.totals?.total_price || latestCart?.totals?.total_price || 0)
      currencyRef.current = String(latestCheckout?.totals?.currency_code || latestCart?.totals?.currency_code || 'GBP').toUpperCase()
    }

    setCouponMessage('Coupon applied')
    clearMountedPaymentMethods()
    setPaymentMethodsOpen(false)
    setRevolutPublicKey('')
  } catch (err) {
    setCouponMessage(decodeHtmlEntities(err?.message || 'Failed to apply coupon'))
  } finally {
    setCouponLoading(false)
  }
}

const handleRemoveCoupon = async (code) => {
  try {
    setCouponLoading(true)
    setCouponMessage('')
    setError('')

    await removeCoupon(code)

    const latestCart = await refreshCart({ silent: true }).catch(() => null)
    const latestCheckout = await getCheckoutData().catch(() => null)

    if (latestCheckout) {
      setCheckoutData(latestCheckout)
      setDraftOrderId(latestCheckout.order_id || null)
      setDraftOrderKey(latestCheckout.order_key || '')
      totalAmountMinorRef.current = Number(latestCheckout?.totals?.total_price || latestCart?.totals?.total_price || 0)
      currencyRef.current = String(latestCheckout?.totals?.currency_code || latestCart?.totals?.currency_code || 'GBP').toUpperCase()
    }

    setCouponMessage('Coupon removed')
    clearMountedPaymentMethods()
    setPaymentMethodsOpen(false)
    setRevolutPublicKey('')
  } catch (err) {
    setCouponMessage(decodeHtmlEntities(err?.message || 'Failed to remove coupon'))
  } finally {
    setCouponLoading(false)
  }
}

const handleCardPay = async () => {
  try {
    if (!cardFieldInstanceRef.current) {
      throw new Error('Card field is not ready')
    }

    if (!latestWooOrderIdRef.current) {
      throw new Error('Order id is missing')
    }

    setPaymentLoading(true)
    setIsFinalizingOrder(true)
    setError('')

    const isValid = validateCheckoutBeforePayment()

    if (!isValid) {
      setPaymentLoading(false)
      setIsFinalizingOrder(false)
      return
    }

    try {
      await updateCheckoutCustomer({
        billingAddress: {
          first_name: billing.first_name,
          last_name: billing.last_name,
          address_1: billing.address_1,
          address_2: billing.address_2,
          city: billing.city,
          state: normalizeUsState(billing.state),
          postcode: billing.postcode,
          country: billing.country,
          email: contact.email,
          phone: contact.phone
        },
        shippingAddress: useSeparateShipping
          ? {
              first_name: shipping.first_name,
              last_name: shipping.last_name,
              address_1: shipping.address_1,
              address_2: shipping.address_2,
              city: shipping.city,
              state: normalizeUsState(shipping.state),
              postcode: shipping.postcode,
              country: shipping.country
            }
          : {
              first_name: billing.first_name,
              last_name: billing.last_name,
              address_1: billing.address_1,
              address_2: billing.address_2,
              city: billing.city,
              state: normalizeUsState(billing.state),
              postcode: billing.postcode,
              country: billing.country
            }
      })

      await updateRevolutOrderDetails({
        order_id: latestWooOrderIdRef.current,
        billing: {
          first_name: billing.first_name,
          last_name: billing.last_name,
          address_1: billing.address_1,
          address_2: billing.address_2,
          city: billing.city,
          state: normalizeUsState(billing.state),
          postcode: billing.postcode,
          country: billing.country,
          email: contact.email,
          phone: contact.phone
        },
        shipping: useSeparateShipping
          ? {
              first_name: shipping.first_name,
              last_name: shipping.last_name,
              address_1: shipping.address_1,
              address_2: shipping.address_2,
              city: shipping.city,
              state: normalizeUsState(shipping.state),
              postcode: shipping.postcode,
              country: shipping.country
            }
          : {
              first_name: billing.first_name,
              last_name: billing.last_name,
              address_1: billing.address_1,
              address_2: billing.address_2,
              city: billing.city,
              state: normalizeUsState(billing.state),
              postcode: billing.postcode,
              country: billing.country
            }
      })
    } catch (err) {
      if (applyServerValidationErrors(err)) {
        setPaymentLoading(false)
        setIsFinalizingOrder(false)
        return
      }
      throw err
    }

    const billingAddress = {
      countryCode: billing.country || undefined,
      region: normalizeUsState(billing.state) || undefined,
      city: billing.city || undefined,
      postcode: billing.postcode || undefined,
      streetLine1: billing.address_1 || undefined,
      streetLine2: billing.address_2 || undefined
    }

    const shippingAddress = useSeparateShipping
      ? {
          countryCode: shipping.country || undefined,
          region: normalizeUsState(shipping.state) || undefined,
          city: shipping.city || undefined,
          postcode: shipping.postcode || undefined,
          streetLine1: shipping.address_1 || undefined,
          streetLine2: shipping.address_2 || undefined
        }
      : billingAddress

    cardFieldInstanceRef.current.submit({
      name: `${billing.first_name} ${billing.last_name}`.trim() || undefined,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      billingAddress,
      shippingAddress
    })
  } catch (err) {
    setPaymentLoading(false)
    setIsFinalizingOrder(false)
    setError(err?.message || 'Failed to submit card payment')
  }
}

  if (loading || cartLoading) {
    return <div>Loading checkout...</div>
  }

  if (!cartItems?.length) {
    return <div>Your cart is empty.</div>
  }

  return (
    <div className={`checkout-page ${isFinalizingOrder ? 'checkout-page-processing' : ''}`}>
      <div className="checkout-main">
        <section className="checkout-section">
          <h1>Checkout</h1>
          <button type="button" onClick={clearSavedCheckoutDraft}>
            Clear saved test details
          </button>
        </section>

        <section className="checkout-section">
          <h2>Billing address</h2>

{fieldErrors.billing_first_name && (
  <div className="checkout-field-error">{fieldErrors.billing_first_name}</div>
)}
<input
  ref={firstNameRef}
  type="text"
  placeholder="First name *"
  value={billing.first_name}
  onChange={(e) => {
    setBilling((prev) => ({ ...prev, first_name: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, billing_first_name: '' }))
  }}
/>

{fieldErrors.billing_last_name && (
  <div className="checkout-field-error">{fieldErrors.billing_last_name}</div>
)}
<input
  ref={lastNameRef}
  type="text"
  placeholder="Last name *"
  value={billing.last_name}
  onChange={(e) => {
    setBilling((prev) => ({ ...prev, last_name: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, billing_last_name: '' }))
  }}
/>

<input
  type="text"
  placeholder="Country / Region *"
  value="United States (US)"
  readOnly
  tabIndex={-1}
/>

{fieldErrors.billing_address_1 && (
  <div className="checkout-field-error">{fieldErrors.billing_address_1}</div>
)}
<input
  ref={address1Ref}
  type="text"
  placeholder="Street address *"
  value={billing.address_1}
  onChange={(e) => {
    setBilling((prev) => ({ ...prev, address_1: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, billing_address_1: '' }))
  }}
/>

          <input
            type="text"
            placeholder="Apartment, suite, unit, etc. (optional)"
            value={billing.address_2}
            onChange={(e) => setBilling((prev) => ({ ...prev, address_2: e.target.value }))}
          />

{fieldErrors.billing_city && (
  <div className="checkout-field-error">{fieldErrors.billing_city}</div>
)}
<input
  ref={cityRef}
  type="text"
  placeholder="Town / City *"
  value={billing.city}
  onChange={(e) => {
    setBilling((prev) => ({ ...prev, city: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, billing_city: '' }))
  }}
/>

{fieldErrors.billing_state && (
  <div className="checkout-field-error">{fieldErrors.billing_state}</div>
)}
<input
  ref={stateRef}
  type="text"
  placeholder="State *"
  value={billing.state}
  onChange={(e) => {
    setBilling((prev) => ({ ...prev, state: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, billing_state: '' }))
  }}
/>

{fieldErrors.billing_postcode && (
  <div className="checkout-field-error">{fieldErrors.billing_postcode}</div>
)}
<input
  ref={postcodeRef}
  type="text"
  placeholder="ZIP Code *"
  value={billing.postcode}
  onChange={(e) => {
    setBilling((prev) => ({ ...prev, postcode: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, billing_postcode: '' }))
  }}
/>

          <input
            type="text"
            placeholder="Phone (optional)"
            value={contact.phone}
            onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
          />

{fieldErrors.contact_email && (
  <div className="checkout-field-error">{fieldErrors.contact_email}</div>
)}
<input
  ref={emailRef}
  type="email"
  placeholder="Email address *"
  value={contact.email}
  onChange={(e) => {
    setContact((prev) => ({ ...prev, email: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, contact_email: '' }))
  }}
/>
</section>

        <section className="checkout-section">
          <label>
            <input
              type="checkbox"
              checked={useSeparateShipping}
              onChange={(e) => {
  const checked = e.target.checked
  setUseSeparateShipping(checked)
  if (!checked) {
    setFieldErrors((prev) => ({
      ...prev,
      shipping_first_name: '',
      shipping_last_name: '',
      shipping_address_1: '',
      shipping_city: '',
      shipping_state: '',
      shipping_postcode: ''
    }))
  }
}}
            />
            Ship to a different address
          </label>
        </section>

                {useSeparateShipping && (
          <section className="checkout-section">
            <h2>Shipping address</h2>

            {fieldErrors.shipping_first_name && (
              <div className="checkout-field-error">{fieldErrors.shipping_first_name}</div>
            )}
            <input
              ref={shippingFirstNameRef}
              type="text"
              placeholder="First name *"
              value={shipping.first_name}
              onChange={(e) => {
                setShipping((prev) => ({ ...prev, first_name: e.target.value }))
                setFieldErrors((prev) => ({ ...prev, shipping_first_name: '' }))
              }}
            />

            {fieldErrors.shipping_last_name && (
              <div className="checkout-field-error">{fieldErrors.shipping_last_name}</div>
            )}
            <input
              ref={shippingLastNameRef}
              type="text"
              placeholder="Last name *"
              value={shipping.last_name}
              onChange={(e) => {
                setShipping((prev) => ({ ...prev, last_name: e.target.value }))
                setFieldErrors((prev) => ({ ...prev, shipping_last_name: '' }))
              }}
            />

<input
  type="text"
  placeholder="Country / Region *"
  value="United States (US)"
  readOnly
  tabIndex={-1}
/>

            {fieldErrors.shipping_address_1 && (
              <div className="checkout-field-error">{fieldErrors.shipping_address_1}</div>
            )}
            <input
              ref={shippingAddress1Ref}
              type="text"
              placeholder="Street address *"
              value={shipping.address_1}
              onChange={(e) => {
                setShipping((prev) => ({ ...prev, address_1: e.target.value }))
                setFieldErrors((prev) => ({ ...prev, shipping_address_1: '' }))
              }}
            />

            <input
              type="text"
              placeholder="Apartment, suite, unit, etc. (optional)"
              value={shipping.address_2}
              onChange={(e) => setShipping((prev) => ({ ...prev, address_2: e.target.value }))}
            />

            {fieldErrors.shipping_city && (
              <div className="checkout-field-error">{fieldErrors.shipping_city}</div>
            )}
            <input
              ref={shippingCityRef}
              type="text"
              placeholder="Town / City *"
              value={shipping.city}
              onChange={(e) => {
                setShipping((prev) => ({ ...prev, city: e.target.value }))
                setFieldErrors((prev) => ({ ...prev, shipping_city: '' }))
              }}
            />

            {fieldErrors.shipping_state && (
              <div className="checkout-field-error">{fieldErrors.shipping_state}</div>
            )}
            <input
              ref={shippingStateRef}
              type="text"
              placeholder="State *"
              value={shipping.state}
              onChange={(e) => {
                setShipping((prev) => ({ ...prev, state: e.target.value }))
                setFieldErrors((prev) => ({ ...prev, shipping_state: '' }))
              }}
            />

            {fieldErrors.shipping_postcode && (
              <div className="checkout-field-error">{fieldErrors.shipping_postcode}</div>
            )}
            <input
              ref={shippingPostcodeRef}
              type="text"
              placeholder="ZIP Code *"
              value={shipping.postcode}
              onChange={(e) => {
                setShipping((prev) => ({ ...prev, postcode: e.target.value }))
                setFieldErrors((prev) => ({ ...prev, shipping_postcode: '' }))
              }}
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
            <div className="checkout-summary-coupon-block">
  <label className="checkout-summary-coupon-label">Coupon code</label>

  <div className="checkout-summary-coupon-row">
    <input
      type="text"
      value={couponCode}
      onChange={(e) => setCouponCode(e.target.value)}
      placeholder="Enter coupon code"
      disabled={couponLoading || isFinalizingOrder}
    />
    <button
      type="button"
      className="checkout-apply-button"
      onClick={handleApplyCoupon}
      disabled={couponLoading || isFinalizingOrder}
    >
      {couponLoading ? 'Applying...' : 'Apply'}
    </button>
  </div>

  {couponMessage && (
    <div className="checkout-coupon-message">{couponMessage}</div>
  )}

  {!!cart?.coupons?.length && (
    <div className="checkout-applied-coupons">
      {cart.coupons.map((coupon) => (
        <div key={coupon.code} className="checkout-applied-coupon">
          <span>{coupon.code}</span>
          <button
            type="button"
            onClick={() => handleRemoveCoupon(coupon.code)}
            disabled={couponLoading || isFinalizingOrder}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
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
{!!cart?.totals?.total_discount && Number(cart.totals.total_discount) > 0 && (
  <div className="checkout-summary-row">
    <span>Discount</span>
    <span>-{formatWooMoney(cart.totals.total_discount, cart?.totals)}</span>
  </div>
)}
            <div className="checkout-summary-row checkout-summary-total">
              <span>Total</span>
              <span>{formatWooMoney(cart?.totals?.total_price, cart?.totals)}</span>
            </div>

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            <div className="checkout-payment-methods">
  {paymentLoading && !cardReady && !appleGoogleReady && !revolutPayReady && (
    <div>Preparing payment methods...</div>
  )}

  {!cardReady && !appleGoogleReady && !revolutPayReady && !paymentLoading && (
    <div>Payment methods unavailable or still loading.</div>
  )}

  <div className="checkout-payment-option">
    <label className="checkout-payment-option-label">
      <input
        type="radio"
        name="payment_method"
        value="wallet"
        checked={selectedPaymentMethod === 'wallet'}
        onChange={() => setSelectedPaymentMethod('wallet')}
        disabled={isFinalizingOrder}
      />
      <span>Google Pay</span>
    </label>

    <div className={`checkout-payment-option-body ${selectedPaymentMethod === 'wallet' ? 'is-active' : 'is-hidden'}`}>
      <div ref={appleGoogleContainerRef} id="revolut-payment-request"></div>
      {!appleGoogleReady && <div>Google Pay unavailable or still loading.</div>}
    </div>
  </div>

  <div className="checkout-payment-option">
    <label className="checkout-payment-option-label">
      <input
        type="radio"
        name="payment_method"
        value="revolut_pay"
        checked={selectedPaymentMethod === 'revolut_pay'}
        onChange={() => setSelectedPaymentMethod('revolut_pay')}
        disabled={isFinalizingOrder}
      />
      <span>Revolut Pay</span>
    </label>

    <div className={`checkout-payment-option-body ${selectedPaymentMethod === 'revolut_pay' ? 'is-active' : 'is-hidden'}`}>
      <div ref={revolutPayContainerRef} id="revolut-pay-button"></div>
      {!revolutPayReady && <div>Revolut Pay unavailable or still loading.</div>}
    </div>
  </div>

  <div className="checkout-payment-option">
    <label className="checkout-payment-option-label">
      <input
        type="radio"
        name="payment_method"
        value="card"
        checked={selectedPaymentMethod === 'card'}
        onChange={() => setSelectedPaymentMethod('card')}
        disabled={isFinalizingOrder}
      />
      <span>Pay by card</span>
    </label>

    <div className={`checkout-payment-option-body ${selectedPaymentMethod === 'card' ? 'is-active' : 'is-hidden'}`}>
      <div ref={cardContainerRef} id="revolut-card-field"></div>
      {!cardReady && <div>Card payment unavailable or still loading.</div>}
      <button
        type="button"
        onClick={handleCardPay}
        disabled={paymentLoading || !cardReady || isFinalizingOrder}
        className={`checkout-pay-button ${paymentLoading || isFinalizingOrder ? 'is-loading' : ''}`}
      >
        {(paymentLoading || isFinalizingOrder) ? (
          <>
            <span className="checkout-button-spinner"></span>
            <span>Processing</span>
          </>
        ) : (
          'Pay now'
        )}
      </button>
    </div>
  </div>
</div>
          </div>
        </section>
      </aside>
      {isFinalizingOrder && (
  <div className="checkout-processing-overlay" aria-hidden="true"></div>
)}
    </div>
  )
}