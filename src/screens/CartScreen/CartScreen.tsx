import { useMemo, useState } from "react";
import {
  IconShoppingCart,
  IconExternalLink,
  IconMinus,
  IconPlus,
  IconTrash,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Card } from "../../components/Card/Card";
import { Button } from "../../components/Button/Button";
import styles from "./CartScreen.module.css";

/**
 * 장바구니 화면.
 * 기술 스펙(02_technical_spec.md §5 `GET /cart`, §6 쿠팡파트너스)을 반영한다.
 * - 부족 재료를 재료 단위로 합산해 보여준다(여러 레시피에서 겹치면 needForRecipes에 누적).
 * - 각 재료는 쿠팡 검색 링크로 연결(딥링크 API 승인 전까지 일반 검색 URL로 운영).
 * - 쿠팡 파트너스 고지 문구를 화면에 고정 노출한다.
 * 백엔드 연동 전까지는 목업 데이터/로컬 상태를 사용한다.
 */

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  /** 이 재료가 필요한 레시피 목록(합산 근거) */
  needForRecipes: string[];
}

const INITIAL_CART: CartItem[] = [
  { id: 1, name: "고추장", quantity: 1, unit: "개", needForRecipes: ["제육볶음"] },
  { id: 2, name: "순두부", quantity: 1, unit: "모", needForRecipes: ["순두부찌개"] },
  { id: 3, name: "계란", quantity: 6, unit: "개", needForRecipes: ["순두부찌개", "계란볶음밥"] },
  { id: 4, name: "파스타면", quantity: 1, unit: "개", needForRecipes: ["토마토 파스타"] },
  { id: 5, name: "파마산치즈", quantity: 1, unit: "개", needForRecipes: ["토마토 파스타"] },
];

function coupangSearchUrl(name: string): string {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(name)}`;
}

export function CartScreen() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART);

  const totalCount = useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items]);

  const changeQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it,
      ),
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <IconShoppingCart size={32} stroke={1.5} className={styles.emptyIcon} />
        장바구니가 비었어요.
        <span className={styles.emptySub}>레시피에서 부족한 재료를 담아보세요.</span>
      </div>
    );
  }

  return (
    <>
      <p className={styles.summary}>
        부족한 재료 <b>{items.length}</b>종 · 총 <b>{totalCount}</b>개
      </p>

      <div className={styles.list}>
        {items.map((item) => (
          <Card key={item.id} className={styles.itemCard}>
            <div className={styles.itemHead}>
              <div className={styles.itemBody}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemMeta}>
                  {item.needForRecipes.join(" · ")} 레시피에 필요
                </div>
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                aria-label={`${item.name} 삭제`}
                onClick={() => removeItem(item.id)}
              >
                <IconTrash size={18} stroke={1.75} />
              </button>
            </div>

            <div className={styles.itemActions}>
              <div className={styles.stepper}>
                <button
                  type="button"
                  aria-label={`${item.name} 수량 줄이기`}
                  onClick={() => changeQty(item.id, -1)}
                  disabled={item.quantity <= 1}
                >
                  <IconMinus size={16} stroke={2} />
                </button>
                <span className={styles.qty}>
                  {item.quantity}
                  {item.unit}
                </span>
                <button
                  type="button"
                  aria-label={`${item.name} 수량 늘리기`}
                  onClick={() => changeQty(item.id, 1)}
                >
                  <IconPlus size={16} stroke={2} />
                </button>
              </div>

              <a
                className={styles.coupangLink}
                href={coupangSearchUrl(item.name)}
                target="_blank"
                rel="noopener noreferrer"
              >
                쿠팡에서 보기
                <IconExternalLink size={15} stroke={1.75} />
              </a>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.ctaWrap}>
        <Button
          variant="primary"
          fullWidth
          icon={<IconShoppingCart size={20} stroke={1.75} />}
          onClick={() => window.open("https://www.coupang.com", "_blank", "noopener,noreferrer")}
        >
          쿠팡에서 전체 담기
        </Button>
      </div>

      <p className={styles.disclosure}>
        <IconInfoCircle size={14} stroke={1.75} />
        쿠팡 파트너스 활동으로 일정 수수료를 제공받습니다.
      </p>
    </>
  );
}
