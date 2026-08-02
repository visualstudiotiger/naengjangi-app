import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 캐릭터 카드 등 강조 표면(뮤트 배경) */
  muted?: boolean;
  children: ReactNode;
}

export function Card({ muted = false, children, className, ...rest }: CardProps) {
  const classes = [styles.card, muted ? styles.muted : "", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
