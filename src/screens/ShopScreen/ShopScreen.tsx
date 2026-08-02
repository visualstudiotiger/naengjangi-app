import { useState } from "react";
import { IconLock } from "@tabler/icons-react";
import { Card } from "../../components/Card/Card";
import { Badge } from "../../components/Badge/Badge";
import { Button } from "../../components/Button/Button";
import styles from "./ShopScreen.module.css";

/**
 * 상점 화면.
 * 기술 스펙(02_technical_spec.md §4 items, §5 GET /shop/items·POST /shop/purchase)을 반영한다.
 * - 콩알(콩알 잔액)로 캐릭터 꾸미기 아이템을 구매한다.
 * - 성장 단계(stage_requirement) 미달 아이템은 디자인 시스템 §5 규칙대로 점선·자물쇠로 잠금 표시.
 * - 보유중 / 구매 가능 / 콩알 부족 / 잠금 상태를 구분한다.
 * 백엔드 연동 전까지 목업 데이터/로컬 상태를 사용한다.
 */

/** 캐릭터 성장 단계(단조 증가). 현재 캐릭터는 "어린이" 단계. */
const GROWTH_STAGES = ["아기", "어린이", "청소년", "20~30대", "40~50대"] as const;
type GrowthStage = (typeof GROWTH_STAGES)[number];
const CURRENT_STAGE: GrowthStage = "어린이";

interface ShopItem {
  id: number;
  name: string;
  emoji: string;
  slot: string; // 머리/얼굴, 몸/의상, 배경, 소품·이펙트
  stage: GrowthStage; // 착용 가능 성장 단계
  price: number; // 콩알 가격
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 1, name: "병아리 모자", emoji: "🧢", slot: "머리/얼굴", stage: "아기", price: 80 },
  { id: 2, name: "딸기 리본", emoji: "🎀", slot: "머리/얼굴", stage: "어린이", price: 120 },
  { id: 3, name: "냉장고 앞치마", emoji: "🍳", slot: "몸/의상", stage: "어린이", price: 150 },
  { id: 4, name: "꽃 화분", emoji: "🪴", slot: "소품·이펙트", stage: "아기", price: 60 },
  { id: 5, name: "별밤 배경", emoji: "🌌", slot: "배경", stage: "청소년", price: 200 },
  { id: 6, name: "황금 왕관", emoji: "👑", slot: "머리/얼굴", stage: "20~30대", price: 500 },
];

const INITIAL_OWNED = [4]; // 꽃 화분은 이미 보유

function isUnlocked(stage: GrowthStage): boolean {
  return GROWTH_STAGES.indexOf(stage) <= GROWTH_STAGES.indexOf(CURRENT_STAGE);
}

interface ShopScreenProps {
  beans: number;
  onPurchase: (price: number) => void;
}

export function ShopScreen({ beans, onPurchase }: ShopScreenProps) {
  const [ownedIds, setOwnedIds] = useState<Set<number>>(new Set(INITIAL_OWNED));

  const buy = (item: ShopItem) => {
    if (ownedIds.has(item.id) || item.price > beans) return;
    onPurchase(item.price);
    setOwnedIds((prev) => new Set(prev).add(item.id));
  };

  return (
    <>
      <p className={styles.intro}>콩알을 모아 냉장이를 꾸며보세요.</p>

      <div className={styles.grid}>
        {SHOP_ITEMS.map((item) => {
          const owned = ownedIds.has(item.id);
          const unlocked = isUnlocked(item.stage);
          const affordable = item.price <= beans;

          return (
            <Card key={item.id} className={`${styles.itemCard} ${!unlocked ? styles.locked : ""}`}>
              <div className={styles.thumb}>
                {unlocked ? (
                  <span className={styles.emoji}>{item.emoji}</span>
                ) : (
                  <IconLock size={24} stroke={1.75} className={styles.lockIcon} />
                )}
              </div>

              <div className={styles.name}>{item.name}</div>
              <div className={styles.slot}>{item.slot}</div>

              <div className={styles.actionRow}>
                {!unlocked ? (
                  <span className={styles.lockLabel}>{item.stage} 단계부터</span>
                ) : owned ? (
                  <Badge tone="positive">보유중</Badge>
                ) : (
                  <Button
                    variant="secondary"
                    fullWidth
                    disabled={!affordable}
                    onClick={() => buy(item)}
                  >
                    {affordable ? `🫘 ${item.price}` : "콩알 부족"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
