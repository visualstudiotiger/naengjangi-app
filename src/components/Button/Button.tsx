import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary(코랄)는 화면당 1개만 사용. 기본값 secondary. */
  variant?: Variant;
  fullWidth?: boolean;
  /** 좌측 아이콘 (Tabler Icons 권장) */
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "secondary",
  fullWidth = false,
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [styles.base, styles[variant], fullWidth ? styles.fullWidth : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
