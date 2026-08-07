/**
 * Polar (polar.sh) Sandbox Payment Integration
 * Product ID: ba8b31d2-9209-444f-ab67-c42412679e24
 */

export const POLAR_CONFIG = {
  productId: 'ba8b31d2-9209-444f-ab67-c42412679e24',
  environment: 'sandbox',
  accessToken: import.meta.env.POLAR_ACCESS_TOKEN || import.meta.env.VITE_POLAR_ACCESS_TOKEN || '',
  sandboxApiUrl: 'https://sandbox-api.polar.sh/v1',
  productionApiUrl: 'https://api.polar.sh/v1',
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
 * Creates a valid Polar Checkout Session via API POST /v1/checkouts/
 */
export async function createCheckoutSession(customerEmail?: string): Promise<string> {
  const successUrl = `${window.location.origin}/shop?payment=success`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (POLAR_CONFIG.accessToken) {
    headers['Authorization'] = `Bearer ${POLAR_CONFIG.accessToken}`
  }

  // Try Sandbox API endpoint first, fallback to Production API if product exists there
  const apiUrls = [POLAR_CONFIG.sandboxApiUrl, POLAR_CONFIG.productionApiUrl]

  for (const baseUrl of apiUrls) {
    try {
      const res = await fetch(`${baseUrl}/checkouts/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          products: [POLAR_CONFIG.productId],
          success_url: successUrl,
          ...(customerEmail ? { customer_email: customerEmail } : {}),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data?.url) return data.url
      }
    } catch {
      // Continue to next endpoint attempt
    }
  }

  // Direct checkout link fallback
  return `https://buy.polar.sh/${POLAR_CONFIG.productId}`
}

/**
 * Open Polar Sandbox Checkout Session
 */
export async function openPolarSandboxCheckout(options?: { customerEmail?: string }) {
  const checkoutUrl = await createCheckoutSession(options?.customerEmail)

  const width = 520
  const height = 740
  const left = window.screen.width / 2 - width / 2
  const top = window.screen.height / 2 - height / 2

  const popup = window.open(
    checkoutUrl,
    'PolarCheckout',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  )

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    window.location.href = checkoutUrl
  }
}
