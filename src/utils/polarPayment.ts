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

export function getProMembershipKey(userId?: string | null): string {
  if (!userId) return PRO_MEMBERSHIP_KEY
  return `${PRO_MEMBERSHIP_KEY}_${userId}`
}

export function getProMembership(userId?: string | null): ProMembershipStatus {
  try {
    const key = getProMembershipKey(userId)
    const saved = localStorage.getItem(key)
    if (!saved) return { isPro: false, subscribedAt: null }
    return JSON.parse(saved)
  } catch {
    return { isPro: false, subscribedAt: null }
  }
}

export function setProMembership(isPro: boolean, userId?: string | null, checkoutId?: string): ProMembershipStatus {
  const key = getProMembershipKey(userId)
  const status: ProMembershipStatus = {
    isPro,
    subscribedAt: isPro ? new Date().toISOString() : null,
    checkoutId,
  }
  localStorage.setItem(key, JSON.stringify(status))
  return status
}

/**
 * Reset / Cancel PRO membership status for a user
 */
export function cancelProMembership(userId?: string | null): ProMembershipStatus {
  const key = getProMembershipKey(userId)
  localStorage.removeItem(key)
  localStorage.removeItem(PRO_MEMBERSHIP_KEY)
  return { isPro: false, subscribedAt: null }
}

/**
 * Creates a valid Polar Checkout Session via API POST /v1/checkouts/
 */
export async function createCheckoutSession(customerEmail?: string): Promise<{ url: string | null; error: string | null }> {
  if (POLAR_CONFIG.customCheckoutUrl) {
    return { url: POLAR_CONFIG.customCheckoutUrl, error: null }
  }

  const successUrl = `${window.location.origin}/shop?checkout_id={CHECKOUT_ID}`
  const token = POLAR_CONFIG.accessToken

  if (!token) {
    return {
      url: null,
      error: 'Polar Organization Access Token(POLAR_ACCESS_TOKEN)이 환경 변수에 설정되어 있지 않습니다.',
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }

  const apiUrls = [POLAR_CONFIG.sandboxApiUrl, POLAR_CONFIG.productionApiUrl]
  const payloadVariations = [
    {
      product_id: POLAR_CONFIG.productId,
      success_url: successUrl,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    },
    {
      products: [POLAR_CONFIG.productId],
      success_url: successUrl,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    },
    {
      product_price_id: POLAR_CONFIG.productId,
      success_url: successUrl,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    },
  ]

  const errorLogs: string[] = []

  for (const baseUrl of apiUrls) {
    for (const body of payloadVariations) {
      try {
        const res = await fetch(`${baseUrl}/checkouts/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })

        if (res.ok) {
          const data = await res.json()
          if (data?.url) return { url: data.url, error: null }
        } else {
          const errData = await res.json().catch(() => null)
          const detail = typeof errData?.detail === 'object'
            ? JSON.stringify(errData.detail)
            : errData?.detail || errData?.message || (errData ? JSON.stringify(errData) : res.statusText)
          errorLogs.push(`[${baseUrl} Status ${res.status}] ${detail}`)
        }
      } catch (err) {
        errorLogs.push(`[${baseUrl} Network Error] ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  const lastErr = errorLogs.length > 0 ? errorLogs[0] : '알 수 없는 Polar API 응답 오류'
  return {
    url: null,
    error: `Polar API 오류: ${lastErr}`,
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

  // Mobile / Popup Handling
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  if (isMobile) {
    window.location.href = url
    return { success: true }
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
