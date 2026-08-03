import { useState } from 'react'
import {
  IconBell,
  IconChevronRight,
  IconClockHour6,
  IconLogout,
} from '@tabler/icons-react'
import { Card } from '../../components/Card/Card'
import { Badge } from '../../components/Badge/Badge'
import { NaengjangiCharacter } from '../../components/Character/NaengjangiCharacter'
import { useAuth } from '../../auth/AuthContext'
import { useAppContext } from '../../layout/outletContext'
import styles from './MyPageScreen.module.css'

// 02_technical_spec.md users.notification_pref
const PREFS = [
  { key: 'quiet', label: '조용히' },
  { key: 'normal', label: '적당히' },
  { key: 'active', label: '적극적으로' },
] as const

export function MyPageScreen() {
  const { user, signOut } = useAuth()
  const { beans } = useAppContext()
  const [pref, setPref] = useState<(typeof PREFS)[number]['key']>('normal')
  const [time, setTime] = useState('18:00') // notification_time 기본값 18:00

  const displayName =
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    '냉장이 집사'

  return (
    <>
      <h1 className={styles.title}>마이페이지</h1>

      {/* 캐릭터 + 콩알 */}
      <Card muted className={styles.characterCard}>
        <NaengjangiCharacter size={84} />
        <div className={styles.characterInfo}>
          <div className={styles.characterRow}>
            <span className={styles.characterName}>냉장이</span>
            <Badge tone="positive">어린이 단계</Badge>
          </div>
          <p className={styles.hello}>{displayName} 님과 함께 자라는 중</p>
          <span className={styles.beans}>🫘 콩알 {beans}개</span>
        </div>
      </Card>

      {/* 알림 설정 */}
      <section>
        <h2 className={styles.sectionTitle}>
          <IconBell size={18} stroke={1.8} /> 알림 설정
        </h2>
        <Card>
          <p className={styles.label}>알림 빈도</p>
          <div className={styles.segment} role="group" aria-label="알림 빈도">
            {PREFS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`${styles.segmentBtn} ${pref === p.key ? styles.segmentBtnActive : ''}`}
                aria-pressed={pref === p.key}
                onClick={() => setPref(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className={styles.time}>
            <span className={styles.label}>
              <IconClockHour6 size={16} stroke={1.8} /> 알림 시각
            </span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </Card>
      </section>

      {/* 계정 */}
      <section>
        <h2 className={styles.sectionTitle}>계정</h2>
        <Card>
          <div className={styles.accountRow}>
            <span>이메일</span>
            <span className={styles.accountValue}>{user?.email ?? '—'}</span>
          </div>
          <button type="button" className={styles.logout} onClick={signOut}>
            <span>
              <IconLogout size={18} stroke={1.8} /> 로그아웃
            </span>
            <IconChevronRight size={16} />
          </button>
        </Card>
      </section>
    </>
  )
}
