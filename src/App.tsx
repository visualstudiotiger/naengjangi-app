import { useState } from "react";
import { Routes, Route, Outlet, Navigate, Link } from "react-router-dom";
import { IconUserCircle } from "@tabler/icons-react";
import { BottomNav } from "./components/BottomNav/BottomNav";
import { ReceiptFlow } from "./screens/ReceiptFlow/ReceiptFlow";
import { HomeScreen } from "./screens/HomeScreen/HomeScreen";
import { RecipesScreen } from "./screens/RecipesScreen/RecipesScreen";
import { CartScreen } from "./screens/CartScreen/CartScreen";
import { ShopScreen } from "./screens/ShopScreen/ShopScreen";
import { LoginScreen } from "./screens/LoginScreen/LoginScreen";
import { MyPageScreen } from "./screens/MyPageScreen/MyPageScreen";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAppContext, type AppOutletContext } from "./layout/outletContext";
import styles from "./App.module.css";

/** 헤더 + 하단 탭바 + 영수증 모달을 포함하는 공통 레이아웃. 콩알/모달 상태를 보관. */
function AppLayout() {
  const [beans, setBeans] = useState(320);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const ctx: AppOutletContext = {
    beans,
    purchase: (price) => setBeans((prev) => prev - price),
    openReceipt: () => setReceiptOpen(true),
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>냉장이</h1>
        <div className={styles.headerRight}>
          <span className={styles.beans}>🫘 콩알 {beans}</span>
          <Link to="/mypage" className={styles.profile} aria-label="마이페이지">
            <IconUserCircle size={26} stroke={1.6} />
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet context={ctx} />
      </main>

      <BottomNav />

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

/** ShopScreen에 레이아웃의 콩알 상태를 연결 */
function ShopRoute() {
  const { beans, purchase } = useAppContext();
  return <ShopScreen beans={beans} onPurchase={purchase} />;
}

function App() {
  return (
    <Routes>
      {/* 로그인은 레이아웃/탭바 없이 전체 화면 */}
      <Route path="/login" element={<LoginScreen />} />

      <Route element={<AppLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="recipes" element={<RecipesScreen />} />
        <Route path="cart" element={<CartScreen />} />
        <Route path="shop" element={<ShopRoute />} />
        <Route
          path="mypage"
          element={
            <ProtectedRoute>
              <MyPageScreen />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
