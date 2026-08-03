import { NavLink } from "react-router-dom";
import {
  IconHome,
  IconChefHat,
  IconShoppingCart,
  IconBuildingStore,
  type Icon,
} from "@tabler/icons-react";
import styles from "./BottomNav.module.css";

type Tab = { to: string; label: string; Icon: Icon; end?: boolean };

const TABS: Tab[] = [
  { to: "/", label: "홈", Icon: IconHome, end: true },
  { to: "/recipes", label: "레시피", Icon: IconChefHat },
  { to: "/cart", label: "장바구니", Icon: IconShoppingCart },
  { to: "/shop", label: "상점", Icon: IconBuildingStore },
];

export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="주요 메뉴">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ""}`}
        >
          <Icon size={22} stroke={1.75} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
