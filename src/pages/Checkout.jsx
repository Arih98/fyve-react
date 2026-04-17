import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { CartContext } from '../CartContext'
import {
  getCheckoutPrefill,
  getCheckoutData,
  updateCheckoutCustomer,
  createRevolutOrder,
  clearCheckoutCart
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

function getCheckoutValidationError({ contact, billing, shipping, useSeparateShipping }) {
  if (!billing.first_name.trim()) return 'Please enter your first name'
  if (!billing.last_name.trim()) return 'Please enter your last name'
  if (!billing.address_1.trim()) return 'Please enter your street address'
  if (!billing.city.trim()) return 'Please enter your city'
  if (!billing.state.trim()) return 'Please enter your state'
  if (!billing.postcode.trim()) return 'Please enter your ZIP code'
  if (!contact.email.trim()) return 'Please enter your email address'

  if (useSeparateShipping) {
    if (!shipping.first_name.trim()) return 'Please enter your shipping first name'
    if (!shipping.last_name.trim()) return 'Please enter your shipping last name'
    if (!shipping.address_1.trim()) return 'Please enter your shipping street address'
    if (!shipping.city.trim()) return 'Please enter your shipping city'
    if (!shipping.state.trim()) return 'Please enter your shipping state'
    if (!shipping.postcode.trim()) return 'Please enter your shipping ZIP code'
  }

  return ''
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

  const paymentInitKeyRef = useRef('')

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

const initializePaymentMethods = useCallback(async () => {
  setPaymentLoading(true)
  setError('')

  const latestCheckout = await getCheckoutData()
  setCheckoutData(latestCheckout)
  setDraftOrderId(latestCheckout.order_id || null)
  setDraftOrderKey(latestCheckout.order_key || '')

  paymentSnapshotRef.current = {
    contact: { ...contact },
    billing: { ...billing },
    shipping: { ...shipping },
    useSeparateShipping
  }

  totalAmountMinorRef.current = Number(latestCheckout?.totals?.total_price || cart?.totals?.total_price || 0)
  currencyRef.current = String(latestCheckout?.totals?.currency_code || cart?.totals?.currency_code || 'GBP').toUpperCase()

  const revolutResult = await createRevolutOrder({
    draft_order_id: latestCheckout.order_id || null,
    draft_order_key: latestCheckout.order_key || ''
  })

  if (!revolutResult?.revolut_order_token) {
    throw new Error('Missing Revolut order token')
  }

  if (!revolutResult?.revolut_public_key) {
    throw new Error('Missing Revolut public API key')
  }

  latestWooOrderIdRef.current = revolutResult.wc_order_id || latestCheckout.order_id || null
  setRevolutPublicKey(revolutResult.revolut_public_key)
  setPaymentMethodsOpen(true)
}, [contact, billing, shipping, useSeparateShipping, cart])

  const isPaymentFormReady =
  !!billing.first_name.trim() &&
  !!billing.last_name.trim() &&
  !!billing.address_1.trim() &&
  !!billing.city.trim() &&
  !!billing.state.trim() &&
  !!billing.postcode.trim() &&
  !!contact.email.trim() &&
  (
    !useSeparateShipping ||
    (
      !!shipping.first_name.trim() &&
      !!shipping.last_name.trim() &&
      !!shipping.address_1.trim() &&
      !!shipping.city.trim() &&
      !!shipping.state.trim() &&
      !!shipping.postcode.trim()
    )
  )

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

  const createRevolutCheckoutOrder = useCallback(async () => {
    const latestCheckout = await getCheckoutData()
    setCheckoutData(latestCheckout)
    setDraftOrderId(latestCheckout.order_id || null)
    setDraftOrderKey(latestCheckout.order_key || '')

    const revolutResult = await createRevolutOrder({
      draft_order_id: latestCheckout.order_id || null,
      draft_order_key: latestCheckout.order_key || '',
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
      shipping_country: useSeparateShipping ? shipping.country : billing.country,
    })

    if (!revolutResult?.revolut_order_token) {
      throw new Error('Missing Revolut order token')
    }

    if (!revolutResult?.revolut_public_key) {
      throw new Error('Missing Revolut public API key')
    }

    latestWooOrderIdRef.current = revolutResult.wc_order_id || latestCheckout.order_id || null
    setRevolutPublicKey(revolutResult.revolut_public_key)

    return revolutResult
  }, [
    contact,
    billing,
    shipping,
    useSeparateShipping
  ])

  const createRevolutPaymentOrder = useCallback(async () => {
    const snapshot = paymentSnapshotRef.current

    if (!snapshot) {
      throw new Error('Payment snapshot is missing')
    }

    const latestCheckout = await getCheckoutData()

    const revolutResult = await createRevolutOrder({
      draft_order_id: latestCheckout.order_id || null,
      draft_order_key: latestCheckout.order_key || '',
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
shipping_country: snapshot.useSeparateShipping ? snapshot.shipping.country : snapshot.billing.country,
    })

    if (!revolutResult?.revolut_order_token) {
      throw new Error('Missing Revolut order token')
    }

    latestWooOrderIdRef.current = revolutResult.wc_order_id || latestCheckout.order_id || null

    return revolutResult
  }, [])

  const redirectToSuccess = useCallback(async () => {
    const wooOrderId = latestWooOrderIdRef.current

    if (!wooOrderId) {
      setError('Payment succeeded but order id is missing')
      return
    }

    try {
      await clearCheckoutCart().catch(() => {})
      await refreshCart({ silent: true }).catch(() => {})
    } catch (err) {
    }

    window.location.href = `/checkout/success?order_id=${encodeURIComponent(wooOrderId)}`
  }, [refreshCart])

  const openPaymentMethods = useCallback(async () => {
    if (
      !billing.first_name.trim() ||
      !billing.last_name.trim() ||
      !billing.address_1.trim() ||
      !billing.city.trim() ||
      !billing.state.trim() ||
      !billing.postcode.trim() ||
      !contact.email.trim()
    ) {
      throw new Error('Please complete all required fields')
    }

    if (
      useSeparateShipping &&
      (
        !shipping.first_name.trim() ||
        !shipping.last_name.trim() ||
        !shipping.address_1.trim() ||
        !shipping.city.trim() ||
        !shipping.state.trim() ||
        !shipping.postcode.trim()
      )
    ) {
      throw new Error('Please complete all required shipping fields')
    }

    setPaymentLoading(true)
    setError('')

    paymentSnapshotRef.current = {
      contact: { ...contact },
      billing: { ...billing },
      shipping: { ...shipping },
      useSeparateShipping
    }

    totalAmountMinorRef.current = Number(checkoutData?.totals?.total_price || cart?.totals?.total_price || 0)
    currencyRef.current = String(cart?.totals?.currency_code || checkoutData?.totals?.currency_code || 'GBP').toUpperCase()

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

    const refreshedCheckout = await getCheckoutData().catch(() => null)

    if (refreshedCheckout) {
      setCheckoutData(refreshedCheckout)
      setDraftOrderId(refreshedCheckout.order_id || null)
      setDraftOrderKey(refreshedCheckout.order_key || '')
    }

    await createRevolutCheckoutOrder()
    setPaymentMethodsOpen(true)
  }, [
    billing.first_name,
    billing.last_name,
    billing.address_1,
    billing.city,
    billing.state,
    billing.postcode,
    contact.email,
    contact,
    billing,
    shipping,
    useSeparateShipping,
    checkoutData,
    cart,
    createRevolutCheckoutOrder
  ])

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

        const cardSession = await createRevolutPaymentOrder()
        if (cancelled) return

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
          onSuccess: () => {
            setPaymentLoading(false)
            redirectToSuccess()
          },
          onError: (error) => {
            setPaymentLoading(false)
            setError(error?.message || 'Card payment failed')
          },
          onCancel: () => {
            setPaymentLoading(false)
            setError('Card payment cancelled')
          }
        })

        cardFieldInstanceRef.current = cardField
        setCardReady(true)

        const paymentRequestInstance = payments.paymentRequest(appleGoogleContainerRef.current, {
          amount: totalAmountMinorRef.current,
          currency: currencyRef.current,
          createOrder: async () => {
            const result = await createRevolutPaymentOrder()
            return { publicId: result.revolut_order_token }
          },
          onSuccess: () => {
            redirectToSuccess()
          },
          onError: (error) => {
            setError(error?.message || 'Apple Pay / Google Pay payment failed')
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
            const result = await createRevolutPaymentOrder()
            return { publicId: result.revolut_order_token }
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
              redirectToSuccess()
              break
            case 'error':
              setError(event?.error?.message || 'Revolut Pay payment failed')
              break
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
    redirectToSuccess,
    clearMountedPaymentMethods,
    createRevolutPaymentOrder
  ])

  const handleCardPay = async () => {
  try {
    if (!cardFieldInstanceRef.current) {
      throw new Error('Card field is not ready')
    }

    setPaymentLoading(true)
    setError('')

    const validationError = getCheckoutValidationError({
      contact,
      billing,
      shipping,
      useSeparateShipping
    })

    if (validationError) {
      setPaymentLoading(false)
      setError(validationError)
      return
    }

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

    paymentSnapshotRef.current = {
      contact: { ...contact },
      billing: { ...billing },
      shipping: { ...shipping },
      useSeparateShipping
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
    <div className="checkout-page">
      <div className="checkout-main">
        <section className="checkout-section">
          <h1>Checkout</h1>
          <button type="button" onClick={clearSavedCheckoutDraft}>
            Clear saved test details
          </button>
        </section>

        <section className="checkout-section">
          <h2>Billing address</h2>

          <input
            type="text"
            placeholder="First name *"
            value={billing.first_name}
            onChange={(e) => setBilling((prev) => ({ ...prev, first_name: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Last name *"
            value={billing.last_name}
            onChange={(e) => setBilling((prev) => ({ ...prev, last_name: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Country / Region *"
            value="United States (US)"
            readOnly
          />

          <input
            type="text"
            placeholder="Street address *"
            value={billing.address_1}
            onChange={(e) => setBilling((prev) => ({ ...prev, address_1: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Apartment, suite, unit, etc. (optional)"
            value={billing.address_2}
            onChange={(e) => setBilling((prev) => ({ ...prev, address_2: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Town / City *"
            value={billing.city}
            onChange={(e) => setBilling((prev) => ({ ...prev, city: e.target.value }))}
          />

          <input
            type="text"
            placeholder="State *"
            value={billing.state}
            onChange={(e) => setBilling((prev) => ({ ...prev, state: e.target.value }))}
          />

          <input
            type="text"
            placeholder="ZIP Code *"
            value={billing.postcode}
            onChange={(e) => setBilling((prev) => ({ ...prev, postcode: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Phone (optional)"
            value={contact.phone}
            onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
          />

          <input
            type="email"
            placeholder="Email address *"
            value={contact.email}
            onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
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
              placeholder="First name *"
              value={shipping.first_name}
              onChange={(e) => setShipping((prev) => ({ ...prev, first_name: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Last name *"
              value={shipping.last_name}
              onChange={(e) => setShipping((prev) => ({ ...prev, last_name: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Country / Region *"
              value="United States (US)"
              readOnly
            />

            <input
              type="text"
              placeholder="Street address *"
              value={shipping.address_1}
              onChange={(e) => setShipping((prev) => ({ ...prev, address_1: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Apartment, suite, unit, etc. (optional)"
              value={shipping.address_2}
              onChange={(e) => setShipping((prev) => ({ ...prev, address_2: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Town / City *"
              value={shipping.city}
              onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))}
            />

            <input
              type="text"
              placeholder="State *"
              value={shipping.state}
              onChange={(e) => setShipping((prev) => ({ ...prev, state: e.target.value }))}
            />

            <input
              type="text"
              placeholder="ZIP Code *"
              value={shipping.postcode}
              onChange={(e) => setShipping((prev) => ({ ...prev, postcode: e.target.value }))}
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

  <div className="checkout-section">
    <h2>Google Pay</h2>
    <div ref={appleGoogleContainerRef} id="revolut-payment-request"></div>
    {!appleGoogleReady && <div>Google Pay unavailable or still loading.</div>}
  </div>

  <div className="checkout-section">
    <h2>Revolut Pay</h2>
    <div ref={revolutPayContainerRef} id="revolut-pay-button"></div>
    {!revolutPayReady && <div>Revolut Pay unavailable or still loading.</div>}
  </div>

  <div className="checkout-section">
    <h2>Pay by card</h2>
    <div ref={cardContainerRef} id="revolut-card-field"></div>
    <button
      type="button"
      onClick={handleCardPay}
      disabled={paymentLoading || !cardReady}
    >
      {paymentLoading ? 'Processing payment...' : 'Pay now'}
    </button>
  </div>
</div>
          </div>
        </section>
      </aside>
    </div>
  )
}