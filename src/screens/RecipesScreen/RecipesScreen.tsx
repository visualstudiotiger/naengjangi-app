import { useMemo, useState } from "react";
import {
  IconSalad,
  IconSoup,
  IconMeat,
  IconEgg,
  IconToolsKitchen2,
  IconClock,
  IconAlertTriangle,
  IconShoppingCartPlus,
  IconCheck,
} from "@tabler/icons-react";
import { Card } from "../../components/Card/Card";
import { Badge } from "../../components/Badge/Badge";
import { Button } from "../../components/Button/Button";
import styles from "./RecipesScreen.module.css";

/**
 * 레시피 화면.
 * 기술 스펙(02_technical_spec.md §5)의 `GET /recipes?tab=` 3분류를 그대로 UI 탭으로 매핑한다.
 * - recommended: 부분 매칭 — 냉장고 재료로 거의 만들 수 있는 레시피(부족 재료 표시)
 * - available: 완전 매칭 — 재료가 다 있는 레시피
 * - expiring: 유통기한 임박 재료를 소진할 수 있는 레시피
 * 백엔드 연동 전까지는 목업 데이터를 사용한다.
 */

type RecipeTab = "recommended" | "available" | "expiring";

const TABS: { key: RecipeTab; label: string }[] = [
  { key: "recommended", label: "추천" },
  { key: "available", label: "만들 수 있는" },
  { key: "expiring", label: "임박 재료" },
];

interface Recipe {
  id: number;
  name: string;
  time: number; // 분
  ingredientCount: number;
  Icon: typeof IconSalad;
  /** 부족한 재료(완전 매칭이면 빈 배열) */
  missing: string[];
  /** 유통기한 임박 재료를 소진하는 레시피일 때 표시 */
  expiring?: { name: string; dday: number };
}

const RECIPES: Recipe[] = [
  {
    id: 1,
    name: "닭가슴살 샐러드",
    time: 15,
    ingredientCount: 4,
    Icon: IconSalad,
    missing: [],
  },
  {
    id: 2,
    name: "계란볶음밥",
    time: 10,
    ingredientCount: 5,
    Icon: IconEgg,
    missing: [],
    expiring: { name: "대파", dday: 2 },
  },
  {
    id: 3,
    name: "된장국",
    time: 15,
    ingredientCount: 5,
    Icon: IconSoup,
    missing: [],
    expiring: { name: "애호박", dday: 1 },
  },
  {
    id: 4,
    name: "제육볶음",
    time: 25,
    ingredientCount: 7,
    Icon: IconMeat,
    missing: ["고추장"],
  },
  {
    id: 5,
    name: "순두부찌개",
    time: 20,
    ingredientCount: 6,
    Icon: IconSoup,
    missing: ["순두부", "계란"],
  },
  {
    id: 6,
    name: "토마토 파스타",
    time: 20,
    ingredientCount: 6,
    Icon: IconToolsKitchen2,
    missing: ["파스타면", "파마산치즈"],
  },
];

const TAB_CAPTION: Record<RecipeTab, (n: number) => string> = {
  recommended: (n) => `냉장고 재료로 만들 수 있는 레시피 ${n}개`,
  available: (n) => `재료가 다 갖춰진 레시피 ${n}개`,
  expiring: (n) => `임박 재료를 소진하는 레시피 ${n}개`,
};

function filterByTab(tab: RecipeTab): Recipe[] {
  switch (tab) {
    case "available":
      return RECIPES.filter((r) => r.missing.length === 0);
    case "expiring":
      return RECIPES.filter((r) => r.expiring).sort(
        (a, b) => (a.expiring!.dday ?? 0) - (b.expiring!.dday ?? 0),
      );
    case "recommended":
    default:
      // 부족 재료가 적은 순 → 바로 만들 수 있는 것부터 위로
      return [...RECIPES].sort((a, b) => a.missing.length - b.missing.length);
  }
}

export function RecipesScreen() {
  const [tab, setTab] = useState<RecipeTab>("recommended");
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const recipes = useMemo(() => filterByTab(tab), [tab]);

  const toggleAdd = (id: number) => {
    setAddedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className={styles.tabs} role="tablist" aria-label="레시피 분류">
        {TABS.map(({ key, label }) => {
          const isActive = key === tab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className={styles.caption}>{TAB_CAPTION[tab](recipes.length)}</p>

      {recipes.length === 0 ? (
        <div className={styles.empty}>아직 해당하는 레시피가 없어요.</div>
      ) : (
        <div className={styles.list}>
          {recipes.map((recipe) => {
            const complete = recipe.missing.length === 0;
            const added = addedIds.has(recipe.id);
            return (
              <Card key={recipe.id} className={styles.recipeCard}>
                <div className={styles.recipeHead}>
                  <div className={styles.thumb}>
                    <recipe.Icon size={28} stroke={1.75} />
                  </div>
                  <div className={styles.body}>
                    <div className={styles.name}>{recipe.name}</div>
                    <div className={styles.meta}>
                      <IconClock size={13} stroke={1.75} />
                      {recipe.time}분<span className={styles.dot}>·</span>재료 {recipe.ingredientCount}개
                    </div>
                    <div className={styles.badgeRow}>
                      {complete ? (
                        <Badge tone="positive">재료 다 있어요</Badge>
                      ) : (
                        <Badge tone="warning">{recipe.missing.length}개 부족</Badge>
                      )}
                      {recipe.expiring && (
                        <Badge tone="warning">
                          {recipe.expiring.name} D-{recipe.expiring.dday}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {!complete && (
                  <div className={styles.missingBlock}>
                    <div className={styles.chipRow}>
                      {recipe.missing.map((name) => (
                        <span key={name} className={styles.chip}>
                          {name}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      fullWidth
                      icon={
                        added ? (
                          <IconCheck size={18} stroke={2} />
                        ) : (
                          <IconShoppingCartPlus size={18} stroke={1.75} />
                        )
                      }
                      onClick={() => toggleAdd(recipe.id)}
                      aria-pressed={added}
                    >
                      {added ? "장바구니에 담김" : "부족한 재료 담기"}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === "expiring" && recipes.length > 0 && (
        <div className={styles.hint}>
          <IconAlertTriangle size={16} stroke={1.75} />
          유통기한이 임박한 재료를 먼저 써보세요.
        </div>
      )}
    </>
  );
}
