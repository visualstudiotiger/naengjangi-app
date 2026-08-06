import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Info, Mail, Lock, Sparkles, ArrowLeft, KeyRound } from 'lucide-react'
import { NaengjangiCharacter } from './NaengjangiCharacter'
import { useAuth } from '../auth/AuthContext'

type Mode = 'signin' | 'signup' | 'forgot'

export function LoginScreen() {
  const { user, loading, configured, signIn, signUp, signInWithGoogle, signInWithDemo, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to={from} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)

    if (mode === 'forgot') {
      const { error } = await resetPassword(email)
      setBusy(false)
      if (error && configured) return setError(error)
      setNotice('비밀번호 재설정 이메일을 발송했습니다. 메일함을 확인해 주세요.')
      return
    }

    const fn = mode === 'signin' ? signIn : signUp
    const { error } = await fn(email, password)
    setBusy(false)
    if (error) return setError(error)
    if (mode === 'signup' && configured) {
      return setNotice('가입 확인 이메일을 보냈어요. 메일함의 링크를 클릭해 주시면 가입이 완료됩니다!')
    }
    navigate(from, { replace: true })
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error)
  }

  async function handleDemoLogin() {
    setError(null)
    setBusy(true)
    await signInWithDemo()
    setBusy(false)
    navigate(from, { replace: true })
  }

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '16px',
    border: '1px solid var(--card-border)',
    background: 'var(--card-bg)',
    boxShadow: 'var(--shadow-sm)',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-main)',
    fontSize: '0.92rem',
    outline: 'none',
  }

  return (
    <div className="app-viewport desktop-frame" style={{ justifyContent: 'flex-start' }}>
      <div
        className="fade-in"
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '40px 24px', overflowY: 'auto' }}
      >
        {/* Logo & Character Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <NaengjangiCharacter size={88} />
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-600)' }}>냉장이</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            영수증 한 장으로 시작하는 스마트 냉장고 파먹기 🥦
          </div>
        </div>

        {!configured && (
          <div
            role="status"
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: '#b45309',
              fontSize: '0.78rem',
              lineHeight: 1.4,
            }}
          >
            <Info size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>Supabase 연동 안내:</strong> <code>.env</code>에 Supabase URL/ANON_KEY를 채우면 실제 이메일/소셜 인증이 작동합니다. 
              (현재는 데모 모드로 바로 사용 가능)
            </span>
          </div>
        )}

        {/* Tab Switch (SignIn / SignUp) */}
        {mode !== 'forgot' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'var(--surface-bg)', padding: '4px', borderRadius: '16px' }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setNotice(null) }}
              style={{
                padding: '10px 0',
                borderRadius: '12px',
                border: 'none',
                background: mode === 'signin' ? 'var(--card-bg)' : 'transparent',
                color: mode === 'signin' ? 'var(--primary-600)' : 'var(--text-muted)',
                fontWeight: mode === 'signin' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: mode === 'signin' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setNotice(null) }}
              style={{
                padding: '10px 0',
                borderRadius: '12px',
                border: 'none',
                background: mode === 'signup' ? 'var(--card-bg)' : 'transparent',
                color: mode === 'signup' ? 'var(--primary-600)' : 'var(--text-muted)',
                fontWeight: mode === 'signup' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              회원가입
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 800 }}>
            <button
              type="button"
              onClick={() => setMode('signin')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={18} />
            </button>
            비밀번호 재설정
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            이메일 주소
            <div style={inputContainerStyle}>
              <Mail size={18} color="var(--primary-600)" />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                style={inputStyle}
              />
            </div>
          </label>

          {mode !== 'forgot' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              비밀번호
              <div style={inputContainerStyle}>
                <Lock size={18} color="var(--primary-600)" />
                <input
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6자 이상 비밀번호"
                  style={inputStyle}
                />
              </div>
            </label>
          )}

          {mode === 'signin' && (
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                <KeyRound size={12} style={{ display: 'inline', marginRight: '4px' }} />
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}

          {error && <p style={{ fontSize: '0.8rem', color: '#dc2626', background: 'rgba(220,38,38,0.08)', padding: '10px 12px', borderRadius: '12px' }}>{error}</p>}
          {notice && <p style={{ fontSize: '0.8rem', color: '#059669', background: 'rgba(16,185,129,0.1)', padding: '10px 12px', borderRadius: '12px' }}>{notice}</p>}

          <button type="submit" className="btn-primary" disabled={busy} style={{ marginTop: '4px' }}>
            {busy ? '처리 중…' : mode === 'signin' ? '이메일 로그인' : mode === 'signup' ? '회원가입 완료' : '재설정 링크 보내기'}
          </button>
        </form>

        {/* OAuth & Demo Options */}
        {mode !== 'forgot' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-subtle)', fontSize: '0.78rem' }}>
              <span style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} /> 또는 간편 시작{' '}
              <span style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button type="button" className="btn-secondary" style={{ width: '100%', padding: '12px' }} onClick={handleGoogle}>
                Google 계정으로 계속하기
              </button>
              
              <button
                type="button"
                onClick={handleDemoLogin}
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: 'var(--primary-700)',
                  borderRadius: '16px',
                  padding: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={16} /> 데모 계정으로 1초 만에 바로 체험하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
