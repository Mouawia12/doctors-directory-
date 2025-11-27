const removeNonDigits = (value?: string | null) => (value ? value.replace(/[^\d]/g, '') : '')

const removeInvalidTelChars = (value?: string | null) =>
  value ? value.replace(/[^\d+]/g, '').replace(/\++/g, (_match, offset) => (offset === 0 ? '+' : '')) : ''

export const buildTelLink = (value?: string | null) => {
  const sanitized = removeInvalidTelChars(value)
  return sanitized ? `tel:${sanitized}` : undefined
}

export const buildWhatsAppLink = (value?: string | null) => {
  const digits = removeNonDigits(value)
  return digits ? `https://wa.me/${digits}` : undefined
}
