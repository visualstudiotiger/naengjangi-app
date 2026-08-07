import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Clock, LogOut, ChevronRight, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react'
import { NaengjangiCharacter } from './NaengjangiCharacter'
import { useAuth } from '../auth/AuthContext'
import { useAppContext } from '../layout/outletContext'
import { getProMembership, openPolarSandboxCheckout } from '../utils/polarPayment'

const PREFS = [
  { key: 'quiet', label: '조용히' },
  { key: 'normal', label: '적당히' },
  { key: 'active', label: '적극적으로' },
] as const

export function MyPageScreen() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { beans } = useAppContext()
  const [pref, setPref] = useState<(typeof PREFS)[number]['key']>('normal')
  const [time, setTime] = useState('18:00')
  const [proStatus] = useState(getProMembership)

  const displayName =
    (user?.user_metadata?.name as string | undefined) ?? user?.email?.split('@')[0] ?? '냉장이 집사'

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
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
          <div style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            냉장이 · 어린이 단계
            {proStatus.isPro && (
              <span style={{ background: '#f59e0b', color: 'black', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px' }}>
                PRO 셰프
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '8px' }}>{displayName} 님과 함께 자라는 중</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem' }}>
            🫘 콩알 {beans}
          </span>
        </div>
      </div>

      {/* 멤버십 구독 정보 (Polar Sandbox) */}
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
          <Sparkles size={18} color="#f59e0b" /> 멤버십 구독 (Polar Sandbox)
        </h3>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>구독 상태</span>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: proStatus.isPro ? '#059669' : 'var(--text-muted)',
                background: proStatus.isPro ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0,0,0,0.05)',
                padding: '4px 10px',
                borderRadius: '12px',
              }}
            >
              {proStatus.isPro ? '👑 PRO 셰프 멤버십 이용 중' : '무료 회원'}
            </span>
          </div>

          {!proStatus.isPro ? (
            <button
              type="button"
              onClick={() => openPolarSandboxCheckout({ customerEmail: user?.email })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              Polar 샌드박스로 PRO 업그레이드 <ExternalLink size={14} />
            </button>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#10b981" /> Polar 샌드박스 보안 결제로 보호되고 있습니다.
            </div>
          )}
        </div>
      </div>

      {/* 알림 설정 */}
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
          <Bell size={18} color="#10b981" /> 알림 설정
        </h3>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>알림 빈도</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', padding: '4px' }} role="group" aria-label="알림 빈도">
              {PREFS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={pref === p.key}
                  onClick={() => setPref(p.key)}
                  style={{
                    padding: '9px 0',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: pref === p.key ? 700 : 500,
                    background: pref === p.key ? 'var(--card-bg)' : 'transparent',
                    color: pref === p.key ? 'var(--primary-600)' : 'var(--text-muted)',
                    boxShadow: pref === p.key ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Clock size={16} /> 알림 시각
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      </div>

      {/* 계정 설정 & 로그아웃 */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>계정 정보</h3>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>이메일</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user?.email ?? '데모 게스트'}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              background: 'rgba(225, 29, 72, 0.08)',
              color: '#e11d48',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <LogOut size={18} /> 계정 로그아웃 <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
