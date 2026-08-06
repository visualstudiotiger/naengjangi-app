import { useState } from 'react'
import { Lock } from 'lucide-react'
import { NaengjangiCharacter } from './NaengjangiCharacter'
import { useAppContext } from '../layout/outletContext'

/**
 * 상점 — 콩알로 냉장이 캐릭터 아이템 구매. 성장 단계 미달 아이템은 잠금.
 * (02_technical_spec.md items / shop). junho 디자인 언어로 재스타일.
 */
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
  const { beans, spendBeans } = useAppContext()
  const [ownedIds, setOwnedIds] = useState<Set<number>>(new Set([4]))

  const buy = (item: ShopItem) => {
    if (ownedIds.has(item.id) || item.price > beans) return
    spendBeans(item.price)
    setOwnedIds((prev) => new Set(prev).add(item.id))
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
          <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>냉장이 상점</div>
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

      {/* 아이템 그리드 */}
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
