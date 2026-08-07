/**
 * Polar (polar.sh) Sandbox Payment Integration
 * Product ID: ba8b31d2-9209-444f-ab67-c42412679e24
 */

export const POLAR_CONFIG = {
  productId: 'ba8b31d2-9209-444f-ab67-c42412679e24',
  environment: 'sandbox',
  accessToken: import.meta.env.POLAR_ACCESS_TOKEN || import.meta.env.VITE_POLAR_ACCESS_TOKEN || '',
  sandboxApiUrl: 'https://sandbox-api.polar.sh/v1',
  sandboxCheckoutUrl: 'https://sandbox.polar.sh/checkout/ba8b31d2-9209-444f-ab67-c42412679e24',
} as const

const PRO_MEMBERSHIP_KEY = 'naengjangi_pro_membership'

export type ProMembershipStatus = {
  isPro: boolean
  subscribedAt: string | null
  checkoutId?: string
}

export function getProMembership(): ProMembershipStatus {
  try {
    const saved = localStorage.getItem(PRO_MEMBERSHIP_KEY)
    if (!saved) return { isPro: false, subscribedAt: null }
    return JSON.parse(saved)
  } catch {
    return { isPro: false, subscribedAt: null }
  }
}

export function setProMembership(isPro: boolean, checkoutId?: string): ProMembershipStatus {
  const status: ProMembershipStatus = {
    isPro,
    subscribedAt: isPro ? new Date().toISOString() : null,
    checkoutId,
  }
  localStorage.setItem(PRO_MEMBERSHIP_KEY, JSON.stringify(status))
  return status
}

/**
 * Open Polar Sandbox Checkout
 * Either opens embedded checkout popup or redirects to checkout URL
 */
export function openPolarSandboxCheckout(options?: { customerEmail?: string }) {
  const url = new URL(POLAR_CONFIG.sandboxCheckoutUrl)
  url.searchParams.set('embed', 'true')
  if (options?.customerEmail) {
    url.searchParams.set('customer_email', options.customerEmail)
  }
  url.searchParams.set('redirect_url', `${window.location.origin}/shop?payment=success`)

  // Open in a new centered popup window or redirect
  const width = 500
  const height = 700
  const left = window.screen.width / 2 - width / 2
  const top = window.screen.height / 2 - height / 2

  const popup = window.open(
    url.toString(),
    'PolarSandboxCheckout',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  )

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    // Popup blocked: Fallback to direct redirect
    window.location.href = url.toString()
  }
}
