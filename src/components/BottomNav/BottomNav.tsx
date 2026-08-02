import { IconHome, IconChefHat, IconShoppingCart, IconBuildingStore } from "@tabler/icons-react";
import styles from "./BottomNav.module.css";

const TABS = [
  { key: "home", label: "홈", Icon: IconHome },
  { key: "recipes", label: "레시피", Icon: IconChefHat },
  { key: "cart", label: "장바구니", Icon: IconShoppingCart },
  { key: "shop", label: "상점", Icon: IconBuildingStore },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

interface BottomNavProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className={styles.nav} aria-label="주요 메뉴">
      {TABS.map(({ key, label, Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            className={`${styles.tab} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(key)}
          >
            <Icon size={22} stroke={1.75} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
