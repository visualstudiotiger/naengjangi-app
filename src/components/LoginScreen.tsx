import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import { NaengjangiCharacter } from './NaengjangiCharacter'
import { useAuth } from '../auth/AuthContext'

type Mode = 'signin' | 'signup'

export function LoginScreen() {
  const { user, loading, configured, signIn, signUp, signInWithGoogle } = useAuth()
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
    const fn = mode === 'signin' ? signIn : signUp
    const { error } = await fn(email, password)
    setBusy(false)
    if (error) return setError(error)
    if (mode === 'signup') return setNotice('가입 확인 메일을 보냈어요. 메일함을 확인해 주세요.')
    navigate(from, { replace: true })
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--card-border)',
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
  }

  return (
    <div className="app-viewport desktop-frame" style={{ justifyContent: 'flex-start' }}>
      <div
        className="fade-in"
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '48px 24px', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <NaengjangiCharacter size={88} />
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>냉장이</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>영수증 한 장으로 시작하는 냉장고 파먹기</div>
        </div>

        {!configured && (
          <div
            role="status"
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#b45309',
              fontSize: '0.8rem',
            }}
          >
            <Info size={18} />
            <span>
              Supabase 연결 전이에요. <code>.env</code>에 URL과 anon key를 넣으면 로그인이 활성화됩니다.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            이메일
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            비밀번호
            <input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상" style={inputStyle} />
          </label>

          {error && <p style={{ fontSize: '0.8rem', color: '#dc2626' }}>{error}</p>}
          {notice && <p style={{ fontSize: '0.8rem', color: 'var(--primary-600)' }}>{notice}</p>}

          <button type="submit" className="btn-primary">
            {busy ? '처리 중…' : mode === 'signin' ? '로그인' : '회원가입'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
          <span style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} /> 또는{' '}
          <span style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
        </div>

        <button type="button" className="btn-secondary" style={{ width: '100%', padding: '13px' }} onClick={handleGoogle}>
          Google로 계속하기
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'signin' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setNotice(null)
            }}
            style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer' }}
          >
            {mode === 'signin' ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>
    </div>
  )
}
