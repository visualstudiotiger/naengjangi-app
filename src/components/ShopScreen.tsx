import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Lock, Sparkles, CheckCircle2, ShieldCheck, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'
import { NaengjangiCharacter } from './NaengjangiCharacter'
import { useAppContext } from '../layout/outletContext'
import { useAuth } from '../auth/AuthContext'
import {
  POLAR_CONFIG,
  getProMembership,
  setProMembership,
  openPolarSandboxCheckout,
} from '../utils/polarPayment'

const GROWTH_STAGES = ['아기', '어린이', '청소년', '20~30대', '40~50대'] as const
type GrowthStage = (typeof GROWTH_STAGES)[number]
const CURRENT_STAGE: GrowthStage = '어린이'

type ShopItem = { id: number; name: string; emoji: string; slot: string; stage: GrowthStage; price: number }

const SHOP_ITEMS: ShopItem[] = [
  { id: 1, name: '병아리 모자', emoji: '🧢', slot: '머리/얼굴', stage: '아기', price: 80 },
  { id: 2, name: '딸기 리본', emoji: '🎀', slot: '머리/얼굴', stage: '어린이', price: 120 },
  { id: 3, name: '냉장고 앞치마', emoji: '🍳', slot: '몸/의상', stage: '어린이', price: 150 },
  { id: 4, name: '꽃 화분', emoji: '🪴', slot: '소품·이펙트', stage: '아기', price: 60 },
  { id: 5, name: '별밤 배경', emoji: '🌌', slot: '배경', stage: '청소년', price: 200 },
  { id: 6, name: '황금 왕관', emoji: '👑', slot: '머리/얼굴', stage: '20~30대', price: 500 },
]

const isUnlocked = (stage: GrowthStage) =>
  GROWTH_STAGES.indexOf(stage) <= GROWTH_STAGES.indexOf(CURRENT_STAGE)

export function ShopScreen() {
  const { user } = useAuth()
  const { beans, spendBeans, earnBeans } = useAppContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const [ownedIds, setOwnedIds] = useState<Set<number>>(new Set([4]))
  const [proStatus, setProStatusState] = useState(getProMembership)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Handle URL callback from Polar Sandbox Checkout redirect
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setProMembership(true)
      setProStatusState(getProMembership())
      earnBeans(500) // Grant bonus beans for subscribing
      setShowSuccessToast(true)
      searchParams.delete('payment')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, earnBeans])

  const buy = (item: ShopItem) => {
    if (ownedIds.has(item.id) || item.price > beans) return
    spendBeans(item.price)
    setOwnedIds((prev) => new Set(prev).add(item.id))
  }

  const handlePolarCheckout = async () => {
    setIsCheckoutLoading(true)
    setCheckoutError(null)
    const result = await openPolarSandboxCheckout({ customerEmail: user?.email })
    setIsCheckoutLoading(false)
    if (!result.success && result.error) {
      setCheckoutError(result.error)
    }
  }

  const handleSimulateSandboxSuccess = () => {
    setProMembership(true)
    setProStatusState(getProMembership())
    earnBeans(500)
    setShowSuccessToast(true)
    setCheckoutError(null)
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Success Notification */}
      {showSuccessToast && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={24} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Polar 샌드박스 결제 완료! 👑</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                냉장이 PRO 구독 활성화 + 🫘 콩알 500개가 지급되었습니다!
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessToast(false)}
            style={{ border: 'none', background: 'none', color: 'white', fontWeight: 800, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 캐릭터 히어로 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'linear-gradient(135deg, #10b981, #047857)',
          borderRadius: '24px',
          padding: '18px 20px',
          color: 'white',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
        }}
      >
        <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '20px', padding: '6px' }}>
          <NaengjangiCharacter size={72} />
        </div>
        <div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            냉장이 상점 {proStatus.isPro && <span style={{ background: '#f59e0b', color: 'black', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>PRO 셰프</span>}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '8px' }}>
            어린이 단계 · 콩알로 꾸며보세요
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0,0,0,0.2)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.85rem',
            }}
          >
            🫘 콩알 {beans}
          </span>
        </div>
      </div>

      {/* Polar Sandbox Premium Membership Banner */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.06))',
          border: '1.5px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, color: '#d97706', fontSize: '1.05rem' }}>
            <Sparkles size={20} /> 냉장이 PRO 프리미엄 셰프
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#b45309',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldCheck size={13} /> Polar Sandbox
          </span>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          Polar 결제 시스템(Product ID: <code>{POLAR_CONFIG.productId.slice(0, 8)}…</code>)이 연동된 샌드박스 결제입니다.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div>✨ AI 무제한 레시피 생성</div>
          <div>⚡ OCR 스캔 2배 고속 처리</div>
          <div>🫘 콩알 +500개 즉시 지급</div>
          <div>🚫 모든 광고 제거</div>
        </div>

        {checkoutError && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626',
              fontSize: '0.78rem',
              lineHeight: 1.4,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={15} /> Polar API 연결 안내
            </div>
            <div>{checkoutError}</div>
            <div>
              아래 <strong>'샌드박스 결제 성공 가상 실행'</strong> 버튼으로 프론트엔드 결제 완결 흐름을 즉시 검증하실 수 있습니다!
            </div>
          </div>
        )}

        {proStatus.isPro ? (
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#047857',
              fontSize: '0.85rem',
              fontWeight: 800,
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={18} /> 현재 PRO 셰프 멤버십 이용 중입니다
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handlePolarCheckout}
              disabled={isCheckoutLoading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: isCheckoutLoading ? 0.7 : 1,
              }}
            >
              {isCheckoutLoading ? (
                <>
                  <Loader2 size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                  Polar 결제 세션 생성 중…
                </>
              ) : (
                <>
                  Polar 샌드박스로 결제하기 <ExternalLink size={16} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSimulateSandboxSuccess}
              style={{
                border: 'none',
                background: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px',
              }}
            >
              ⚡ [테스트] 샌드박스 결제 성공 즉시 활성화
            </button>
          </div>
        )}
      </div>

      {/* 아이템 그리드 */}
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0 -6px' }}>콩알 상점 아이템</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {SHOP_ITEMS.map((item) => {
          const owned = ownedIds.has(item.id)
          const unlocked = isUnlocked(item.stage)
          const affordable = item.price <= beans
          return (
            <div
              key={item.id}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', opacity: unlocked ? 1 : 0.7 }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '16px',
                  fontSize: '1.6rem',
                  background: unlocked ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.04)',
                  color: 'var(--text-muted)',
                }}
              >
                {unlocked ? item.emoji : <Lock size={22} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.slot}</div>
              </div>

              {!unlocked ? (
                <span className="badge-dday warning" style={{ borderRadius: '10px' }}>
                  {item.stage} 단계부터
                </span>
              ) : owned ? (
                <span className="badge-dday safe" style={{ borderRadius: '10px' }}>
                  보유중
                </span>
              ) : (
                <button
                  className="btn-secondary"
                  style={{ width: '100%', opacity: affordable ? 1 : 0.5 }}
                  disabled={!affordable}
                  onClick={() => buy(item)}
                >
                  {affordable ? `🫘 ${item.price}` : '콩알 부족'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
