// Shared formatting for restaurant Offers — used by both the public Offers
// page and the owner's offer editor so the two stay visually consistent.

export const OFFER_TYPES = [
  { value: 'percentage', label: 'Percentage Discount', hint: 'e.g. Spend ₹1000, get 10% off' },
  { value: 'flat', label: 'Flat Amount Off', hint: 'e.g. Flat ₹200 off on orders above ₹1000' },
  { value: 'custom', label: 'Custom Offer', hint: 'BOGO, free dessert, happy hour, combo deals — anything else' },
]

// Short badge text shown on an offer card, derived from its type.
export const getOfferBadge = (offer) => {
  const type = offer.offerType || 'percentage'
  if (type === 'flat' && offer.flatTiers?.length) {
    return offer.flatTiers.map(t => `₹${t.amount} OFF on ₹${t.minSpend}+`).join(' · ')
  }
  if (type === 'percentage' && offer.tiers?.length) {
    return offer.tiers.map(t => `₹${t.minSpend}+ → ${t.discountPercent}% OFF`).join(' · ')
  }
  return offer.highlightText || offer.title
}

// Is this offer currently live? Checks active flag, date range, and (if set) time window.
export const isOfferLive = (offer) => {
  if (!offer.active) return false
  const now = new Date()
  // startDate/endDate are calendar days (stored as UTC-midnight ISO strings) — compare
  // by local calendar day, not exact instant, so a UTC offset doesn't push "starts today"
  // into tomorrow (or "ends today" into yesterday) for users east of UTC.
  const start = new Date(offer.startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(offer.endDate)
  end.setHours(23, 59, 59, 999)
  if (now < start || now > end) return false
  if (offer.startTime && offer.endTime) {
    const [nowH, nowM] = [now.getHours(), now.getMinutes()]
    const nowMinutes = nowH * 60 + nowM
    const [sh, sm] = offer.startTime.split(':').map(Number)
    const [eh, em] = offer.endTime.split(':').map(Number)
    const startMinutes = sh * 60 + sm
    const endMinutes = eh * 60 + em
    if (nowMinutes < startMinutes || nowMinutes > endMinutes) return false
  }
  return true
}
