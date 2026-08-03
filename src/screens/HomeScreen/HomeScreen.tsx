import { IconCamera, IconSoup } from '@tabler/icons-react'
import { Card } from '../../components/Card/Card'
import { Badge, type BadgeTone } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { NaengjangiCharacter } from '../../components/Character/NaengjangiCharacter'
import { useAppContext } from '../../layout/outletContext'
import styles from './HomeScreen.module.css'

/**
 * 냉장이 홈 화면.
 * 실제 데이터 연동 전까지 목업 데이터를 사용한다. (03_design_system.md 컴포넌트 규칙 검증용)
 */
const RECOMMENDED_RECIPES: {
  id: number
  name: string
  meta: string
  tone: BadgeTone
  status: string
}[] = [
  { id: 1, name: '닭가슴살 샐러드', meta: '15분 · 재료 4개', tone: 'positive', status: '재료 다 있어요' },
  { id: 2, name: '순두부찌개', meta: '20분 · 재료 6개', tone: 'warning', status: '2개 부족' },
]

export function HomeScreen() {
  const { openReceipt } = useAppContext()

  return (
    <>
      <Card muted className={styles.characterCard}>
        <NaengjangiCharacter size={96} />
        <div className={styles.characterInfo}>
          <div className={styles.characterName}>냉장이</div>
          <div className={styles.characterStage}>어린이 단계 · 오늘도 신선해요</div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: '64%' }} />
          </div>
        </div>
      </Card>

      <h2 className={styles.sectionTitle}>오늘의 추천 레시피</h2>

      {RECOMMENDED_RECIPES.map((recipe) => (
        <Card key={recipe.id} className={styles.recipeCard}>
          <div className={styles.recipeThumb}>
            <IconSoup size={28} stroke={1.75} />
          </div>
          <div className={styles.recipeBody}>
            <div className={styles.recipeName}>{recipe.name}</div>
            <div className={styles.recipeMeta}>{recipe.meta}</div>
            <div className={styles.badgeRow}>
              <Badge tone={recipe.tone}>{recipe.status}</Badge>
            </div>
          </div>
        </Card>
      ))}

      <div className={styles.ctaWrap}>
        <Button
          variant="primary"
          fullWidth
          icon={<IconCamera size={20} stroke={1.75} />}
          onClick={openReceipt}
        >
          영수증 업로드
        </Button>
      </div>
    </>
  )
}
