export function formatWooMoney(amount, money = {}) {
  const minorUnit = Number(money.currency_minor_unit ?? 2)
  const currencyCode = money.currency_code || 'USD'
  const value = Number(amount || 0) / Math.pow(10, minorUnit)

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit
  }).format(value)
}

export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency
  }).format(Number(value || 0))
}