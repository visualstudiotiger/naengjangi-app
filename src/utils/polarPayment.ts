/**
 * Polar (polar.sh) Sandbox Payment Integration
 * Product ID: ba8b31d2-9209-444f-ab67-c42412679e24
 */

export const POLAR_CONFIG = {
  productId: 'ba8b31d2-9209-444f-ab67-c42412679e24',
  environment: 'sandbox',
  get accessToken(): string {
    return (
      localStorage.getItem('naengjangi_polar_token') ||
      import.meta.env.POLAR_ACCESS_TOKEN ||
      import.meta.env.VITE_POLAR_ACCESS_TOKEN ||
      ''
    )
  },
  get customCheckoutUrl(): string {
    return localStorage.getItem('naengjangi_polar_checkout_url') || ''
  },
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
export async function createCheckoutSession(customerEmail?: string): Promise<{ url: string | null; error: string | null }> {
  // 1. If custom checkout URL is saved in localStorage, use it immediately
  if (POLAR_CONFIG.customCheckoutUrl) {
    return { url: POLAR_CONFIG.customCheckoutUrl, error: null }
  }

  const successUrl = `${window.location.origin}/shop?payment=success`
  const token = POLAR_CONFIG.accessToken
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Try Sandbox API endpoint first, fallback to Production API if product exists there
  const apiUrls = [POLAR_CONFIG.sandboxApiUrl, POLAR_CONFIG.productionApiUrl]

  for (const baseUrl of apiUrls) {
    try {
      const res = await fetch(`${baseUrl}/checkouts/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          product_id: POLAR_CONFIG.productId,
          success_url: successUrl,
          ...(customerEmail ? { customer_email: customerEmail } : {}),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data?.url) return { url: data.url, error: null }
      } else {
        const errData = await res.json().catch(() => null)
        console.warn(`Polar API (${baseUrl}) Error:`, res.status, errData)
      }
    } catch (err) {
      console.warn(`Polar API (${baseUrl}) Fetch Error:`, err)
    }
  }

  const isTokenMissing = !token
  const errMsg = isTokenMissing
    ? 'Polar Organization Access Token(POLAR_ACCESS_TOKEN)이 설정되어 있지 않습니다.'
    : 'Polar API 연결 실패: 샌드박스 프로덕트 세션을 생성할 수 없습니다. (OAT 토큰 권한 checkouts:write 필요)'

  return {
    url: null,
    error: errMsg,
  }
}

/**
 * Open Polar Sandbox Checkout Session
 */
export async function openPolarSandboxCheckout(options?: { customerEmail?: string }): Promise<{ success: boolean; error?: string }> {
  const { url, error } = await createCheckoutSession(options?.customerEmail)

  if (!url) {
    return { success: false, error: error ?? '결제 세션을 생성할 수 없습니다.' }
  }

  const width = 520
  const height = 740
  const left = window.screen.width / 2 - width / 2
  const top = window.screen.height / 2 - height / 2

  const popup = window.open(
    url,
    'PolarCheckout',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  )

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    window.location.href = url
  }

  return { success: true }
}
