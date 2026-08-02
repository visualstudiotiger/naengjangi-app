import type { ReactNode } from "react";
import styles from "./Badge.module.css";

/**
 * 신뢰도·긴급도 공통 3색 규칙 (영수증 태그, 레시피 배지, D-day 등에 동일 적용)
 * - positive(민트): 확실함/문제 없음
 * - neutral(회색): 애매하지만 표시
 * - warning(코랄): 확인 필요/부족함
 *
 * 색약 사용자를 위해 항상 텍스트를 함께 표기한다.
 */
export type BadgeTone = "positive" | "neutral" | "warning";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={`${styles.base} ${styles[tone]}`}>{children}</span>;
}
