import { useState } from "react";
import { IconCamera, IconSoup, IconSeeding } from "@tabler/icons-react";
import { Card } from "./components/Card/Card";
import { Badge, type BadgeTone } from "./components/Badge/Badge";
import { Button } from "./components/Button/Button";
import { NaengjangiCharacter } from "./components/Character/NaengjangiCharacter";
import { BottomNav, type TabKey } from "./components/BottomNav/BottomNav";
import { RecipesScreen } from "./screens/RecipesScreen/RecipesScreen";
import { CartScreen } from "./screens/CartScreen/CartScreen";
import { ReceiptFlow } from "./screens/ReceiptFlow/ReceiptFlow";
import styles from "./App.module.css";

/**
 * 냉장이 홈 화면 스캐폴드.
 * 디자인 시스템(03_design_system.md)의 컴포넌트 규칙을 검증하기 위한 시작 화면.
 * 실제 데이터 연동 전까지는 목업 데이터를 사용한다.
 */

const RECOMMENDED_RECIPES: {
  id: number;
  name: string;
  meta: string;
  tone: BadgeTone;
  status: string;
}[] = [
  { id: 1, name: "닭가슴살 샐러드", meta: "15분 · 재료 4개", tone: "positive", status: "재료 다 있어요" },
  { id: 2, name: "순두부찌개", meta: "20분 · 재료 6개", tone: "warning", status: "2개 부족" },
];

function HomeScreen({ onUploadReceipt }: { onUploadReceipt: () => void }) {
  return (
    <>
      <Card muted className={styles.characterCard}>
        <NaengjangiCharacter size={96} />
        <div className={styles.characterInfo}>
          <div className={styles.characterName}>냉장이</div>
          <div className={styles.characterStage}>어린이 단계 · 오늘도 신선해요</div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: "64%" }} />
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
          onClick={onUploadReceipt}
        >
          영수증 업로드
        </Button>
      </div>
    </>
  );
}

function PlaceholderScreen({ label }: { label: string }) {
  return (
    <div className={styles.placeholder}>
      <IconSeeding size={32} stroke={1.5} style={{ margin: "0 auto 8px" }} />
      {label} 화면은 준비 중이에요.
    </div>
  );
}

function CurrentScreen({ tab, onUploadReceipt }: { tab: TabKey; onUploadReceipt: () => void }) {
  switch (tab) {
    case "home":
      return <HomeScreen onUploadReceipt={onUploadReceipt} />;
    case "recipes":
      return <RecipesScreen />;
    case "cart":
      return <CartScreen />;
    default:
      return <PlaceholderScreen label="상점" />;
  }
}

function App() {
  const [tab, setTab] = useState<TabKey>("home");
  const [beans, setBeans] = useState(320);
  const [receiptOpen, setReceiptOpen] = useState(false);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>냉장이</h1>
        <span className={styles.beans}>🫘 콩알 {beans}</span>
      </header>

      <main className={styles.main}>
        <CurrentScreen tab={tab} onUploadReceipt={() => setReceiptOpen(true)} />
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {receiptOpen && (
        <ReceiptFlow
          onClose={() => setReceiptOpen(false)}
          onComplete={(_addedCount, earnedBeans) => {
            setBeans((prev) => prev + earnedBeans);
            setReceiptOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
