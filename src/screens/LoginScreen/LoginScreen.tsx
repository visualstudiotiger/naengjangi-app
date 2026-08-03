import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { IconBrandGoogle, IconInfoCircle } from '@tabler/icons-react'
import { NaengjangiCharacter } from '../../components/Character/NaengjangiCharacter'
import { Button } from '../../components/Button/Button'
import { useAuth } from '../../auth/AuthContext'
import styles from './LoginScreen.module.css'

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
    if (error) {
      setError(error)
      return
    }
    if (mode === 'signup') {
      setNotice('가입 확인 메일을 보냈어요. 메일함을 확인해 주세요.')
      return
    }
    navigate(from, { replace: true })
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error)
  }

  return (
    <div className={styles.login}>
      <div className={styles.brand}>
        <NaengjangiCharacter size={92} />
        <h1 className={styles.title}>냉장이</h1>
        <p className={styles.tagline}>영수증 한 장으로 시작하는 냉장고 파먹기</p>
      </div>

      {!configured && (
        <div className={styles.setup} role="status">
          <IconInfoCircle size={18} stroke={1.8} />
          <p>
            Supabase 연결 전이에요. <code>.env</code>에 URL과 anon key를 넣으면 로그인이
            활성화됩니다.
          </p>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>이메일</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className={styles.field}>
          <span>비밀번호</span>
          <input
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}
        {notice && <p className={styles.notice}>{notice}</p>}

        <Button type="submit" variant="primary" fullWidth>
          {busy ? '처리 중…' : mode === 'signin' ? '로그인' : '회원가입'}
        </Button>
      </form>

      <div className={styles.divider}>
        <span>또는</span>
      </div>

      <button type="button" className={styles.google} onClick={handleGoogle}>
        <IconBrandGoogle size={18} stroke={2} />
        Google로 계속하기
      </button>

      <p className={styles.toggle}>
        {mode === 'signin' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
            setNotice(null)
          }}
        >
          {mode === 'signin' ? '회원가입' : '로그인'}
        </button>
      </p>
    </div>
  )
}
