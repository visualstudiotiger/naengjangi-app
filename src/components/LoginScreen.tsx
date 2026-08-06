import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Info, Mail, Lock, Sparkles, ArrowLeft, KeyRound } from 'lucide-react'
import { NaengjangiCharacter } from './NaengjangiCharacter'
import { useAuth } from '../auth/AuthContext'

type Mode = 'signin' | 'signup' | 'forgot'
type AuthType = 'google' | 'email'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.72L.97 13.02C2.47 16.01 5.48 18 9 18z" />
    <path fill="#FBBC05" d="M3.87 10.8c-.19-.53-.3-1.1-.3-1.8s.11-1.27.3-1.8L.97 4.98C.35 6.2.0 7.57.0 9s.35 2.8.97 4.02l2.9-2.22z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.47 1.99.97 4.98l2.9 2.22C4.59 5.05 6.62 3.58 9 3.58z" />
  </svg>
)

export function LoginScreen() {
  const { user, loading, configured, signIn, signUp, signInWithGoogle, signInWithDemo, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [authType, setAuthType] = useState<AuthType>('email')
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
    setBusy(true)
    const { error } = await signInWithGoogle()
    setBusy(false)
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

        {/* Auth Method Selector (Google 로그인 vs 이메일 로그인) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--surface-bg)', padding: '4px', borderRadius: '16px' }}>
          <button
            type="button"
            onClick={() => { setAuthType('email'); setError(null); setNotice(null) }}
            style={{
              padding: '10px 0',
              borderRadius: '12px',
              border: 'none',
              background: authType === 'email' ? 'var(--card-bg)' : 'transparent',
              color: authType === 'email' ? 'var(--primary-600)' : 'var(--text-muted)',
              fontWeight: authType === 'email' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: authType === 'email' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Mail size={16} /> 이메일 로그인
          </button>
          <button
            type="button"
            onClick={() => { setAuthType('google'); setError(null); setNotice(null) }}
            style={{
              padding: '10px 0',
              borderRadius: '12px',
              border: 'none',
              background: authType === 'google' ? 'var(--card-bg)' : 'transparent',
              color: authType === 'google' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: authType === 'google' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: authType === 'google' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <GoogleIcon /> 구글로 로그인
          </button>
        </div>

        {/* 1. Google OAuth Selected View */}
        {authType === 'google' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                border: '1px solid var(--card-border)',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <GoogleIcon /> {busy ? '구글 로그인 진행 중…' : 'Google 계정으로 로그인하기'}
            </button>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
              구글 계정을 통해 원클릭으로 간편하게 시작합니다.
            </p>
          </div>
        )}

        {/* 2. Email Auth Selected View */}
        {authType === 'email' && (
          <>
            {/* Sub-tab Switch (SignIn / SignUp) */}
            {mode !== 'forgot' && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.82rem', marginBottom: '2px' }}>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); setNotice(null) }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: mode === 'signin' ? 'var(--primary-600)' : 'var(--text-muted)',
                    fontWeight: mode === 'signin' ? 800 : 500,
                    textDecoration: mode === 'signin' ? 'underline' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  기존 계정 로그인
                </button>
                <span style={{ color: 'var(--card-border)' }}>|</span>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setNotice(null) }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: mode === 'signup' ? 'var(--primary-600)' : 'var(--text-muted)',
                    fontWeight: mode === 'signup' ? 800 : 500,
                    textDecoration: mode === 'signup' ? 'underline' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  새 이메일 회원가입
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
          </>
        )}

        {/* Demo Fast Login Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-subtle)', fontSize: '0.78rem', marginTop: '4px' }}>
          <span style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} /> 또는 빠른 체험{' '}
          <span style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
        </div>

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
    </div>
  )
}
