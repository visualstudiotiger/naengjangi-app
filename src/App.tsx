import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { Routes, Route, Outlet, Navigate, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Home,
  Refrigerator,
  Camera,
  Utensils,
  ShoppingCart,
  Moon,
  Sun,
  Leaf,
  User,
  LogOut,
} from 'lucide-react'
import type { Ingredient, Recipe, CartItem } from './types'
import { INITIAL_INGREDIENTS, MOCK_RECIPES } from './data/mockData'
import { getDDayInfo } from './utils/dateUtils'
import { HomeTab } from './components/HomeTab'
import { FridgeTab } from './components/FridgeTab'
import { OcrScanTab } from './components/OcrScanTab'
import { RecipeTab } from './components/RecipeTab'
import { CartTab } from './components/CartTab'
import { AddIngredientModal } from './components/AddIngredientModal'
import { ShopScreen } from './components/ShopScreen'
import { LoginScreen } from './components/LoginScreen'
import { MyPageScreen } from './components/MyPageScreen'
import { SeoHead } from './components/SeoHead'
import ProtectedRoute from './auth/ProtectedRoute'
import { useAuth } from './auth/AuthContext'
import { useAppContext, type AppOutletContext } from './layout/outletContext'

/* ===================== 공통 레이아웃 (헤더 + 탭바 + 모달 + 전역 상태) ===================== */
function AppLayout() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    () => localStorage.getItem('naengjangi_dark') === '1',
  )
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('naengjangi_ingredients')
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS
  })
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('naengjangi_cart')
    return saved ? JSON.parse(saved) : []
  })
  const [beans, setBeans] = useState<number>(() => {
    const saved = localStorage.getItem('naengjangi_beans')
    return saved ? Number(saved) : 320
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(null)

  useEffect(() => {
    localStorage.setItem('naengjangi_ingredients', JSON.stringify(ingredients))
  }, [ingredients])
  useEffect(() => {
    localStorage.setItem('naengjangi_cart', JSON.stringify(cartItems))
  }, [cartItems])
  useEffect(() => {
    localStorage.setItem('naengjangi_beans', String(beans))
  }, [beans])
  useEffect(() => {
    localStorage.setItem('naengjangi_dark', isDarkMode ? '1' : '0')
  }, [isDarkMode])

  const expiringCount = ingredients.filter((i) => getDDayInfo(i.expiryDate).days <= 3).length

  const spendBeans = useCallback((price: number) => setBeans((prev) => prev - price), [])
  const earnBeans = useCallback((amount: number) => setBeans((prev) => prev + amount), [])

  const ctx: AppOutletContext = {
    ingredients,
    recipes: MOCK_RECIPES,
    cartItems,
    beans,
    openAddIngredient: (edit = null) => {
      setEditingIngredient(edit)
      setIsAddModalOpen(true)
    },
    saveIngredient: (ingredient) => {
      setIngredients((prev) =>
        editingIngredient
          ? prev.map((i) => (i.id === ingredient.id ? ingredient : i))
          : [ingredient, ...prev],
      )
    },
    deleteIngredient: (id) => setIngredients((prev) => prev.filter((i) => i.id !== id)),
    addScanned: (items) => setIngredients((prev) => [...items, ...prev]),
    addToCart: (items) =>
      setCartItems((prev) => {
        const existing = new Set(prev.map((i) => i.name))
        return [...items.filter((i) => !existing.has(i.name)), ...prev]
      }),
    toggleCartItem: (id) =>
      setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))),
    removeCartItem: (id) => setCartItems((prev) => prev.filter((i) => i.id !== id)),
    clearCart: () => setCartItems([]),
    purchaseComplete: (purchased) => {
      setIngredients((prev) => [...purchased, ...prev])
      setCartItems((prev) => prev.filter((i) => !i.checked))
    },
    selectedRecipeModal,
    setSelectedRecipeModal,
    spendBeans,
    earnBeans,
  }

  return (
    <div className={`app-viewport desktop-frame ${isDarkMode ? 'dark-theme' : ''}`}>
      <header className="app-header">
        <Link to="/" className="brand-logo" style={{ textDecoration: 'none' }}>
          <div className="icon-badge">
            <Leaf size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', lineHeight: 1.1 }}>냉장이</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              스마트 냉장고 파먹기
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link
            to="/shop"
            title="콩알 상점"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '20px',
              background: 'rgba(255, 107, 53, 0.12)',
              color: 'var(--accent-orange)',
              fontWeight: 800,
              fontSize: '0.8rem',
              textDecoration: 'none',
            }}
          >
            🫘 {beans}
          </Link>
          <button className="header-icon-btn" onClick={() => setIsDarkMode((v) => !v)} title="다크/라이트 모드">
            {isDarkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} />}
          </button>
          <Link to="/mypage" className="header-icon-btn" title="마이페이지">
            <User size={18} />
          </Link>
          <button
            type="button"
            className="header-icon-btn"
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
            title="로그아웃"
            style={{ color: '#e11d48' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="app-content">
        <Outlet context={ctx} />
      </main>

      <nav className="app-bottom-nav">
        <NavItem to="/" label="홈" end icon={<Home size={20} />} />
        <NavItem to="/fridge" label="내 냉장고" icon={<Refrigerator size={20} />} badge={expiringCount} badgeColor="#ff6b35" />
        <NavLink to="/ocr" className="nav-item ocr-special-btn" title="영수증 OCR 스캔">
          <Camera size={26} />
        </NavLink>
        <NavItem to="/recipe" label="AI 레시피" icon={<Utensils size={20} />} />
        <NavItem to="/cart" label="장바구니" icon={<ShoppingCart size={20} />} badge={cartItems.length} badgeColor="#e11d48" />
      </nav>

      <AddIngredientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={ctx.saveIngredient}
        initialData={editingIngredient}
      />
    </div>
  )
}

/** 하단 탭 아이템 (NavLink + active-dot + 배지) */
function NavItem({
  to,
  label,
  icon,
  end,
  badge,
  badgeColor,
}: {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
  badge?: number
  badgeColor?: string
}) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      {({ isActive }) => (
        <>
          <div className="icon-container" style={{ position: 'relative' }}>
            {icon}
            {badge != null && badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-10px',
                  background: badgeColor ?? '#ff6b35',
                  color: 'white',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '8px',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <span>{label}</span>
          {isActive && <span className="active-dot" />}
        </>
      )}
    </NavLink>
  )
}

/* ===================== 라우트 래퍼 (컨텍스트 → junho 컴포넌트 props) ===================== */
function HomeRoute() {
  const ctx = useAppContext()
  const navigate = useNavigate()
  return (
    <>
      <SeoHead title="홈" description="스마트 냉장고 관리 및 D-Day 유통기한 알림 대시보드" />
      <HomeTab
        ingredients={ctx.ingredients}
        recipes={ctx.recipes}
        onNavigateTab={(tab) => navigate(`/${tab}`)}
        onSelectRecipe={(recipe: Recipe) => {
          ctx.setSelectedRecipeModal(recipe)
          navigate('/recipe')
        }}
        onOpenAddIngredientModal={() => ctx.openAddIngredient(null)}
      />
    </>
  )
}

function FridgeRoute() {
  const ctx = useAppContext()
  return (
    <>
      <SeoHead title="내 냉장고" description="보유 식재료 CRUD, 보관장소별(냉장/냉동/실온) 분류 및 유통기한 D-Day 관리" />
      <FridgeTab
        ingredients={ctx.ingredients}
        onAddIngredient={() => ctx.openAddIngredient(null)}
        onEditIngredient={(item) => ctx.openAddIngredient(item)}
        onDeleteIngredient={ctx.deleteIngredient}
      />
    </>
  )
}

function OcrRoute() {
  const ctx = useAppContext()
  const navigate = useNavigate()
  return (
    <>
      <SeoHead title="영수증 OCR 스캔" description="영수증 사진 스캔으로 식재료 자동 등록 및 유통기한 예측" />
      <OcrScanTab
        onAddScannedIngredients={ctx.addScanned}
        onNavigateToFridge={() => navigate('/fridge')}
      />
    </>
  )
}

function RecipeRoute() {
  const ctx = useAppContext()
  const navigate = useNavigate()
  return (
    <>
      <SeoHead title="AI 레시피 추천" description="보유 식재료 매칭률 및 유통기한 임박 재료 기반 AI 레시피 파먹기" />
      <RecipeTab
        recipes={ctx.recipes}
        ingredients={ctx.ingredients}
        onAddToCart={ctx.addToCart}
        onNavigateToCart={() => navigate('/cart')}
        selectedRecipeModal={ctx.selectedRecipeModal}
        onCloseRecipeModal={() => ctx.setSelectedRecipeModal(null)}
      />
    </>
  )
}

function CartRoute() {
  const ctx = useAppContext()
  const navigate = useNavigate()
  return (
    <>
      <SeoHead title="장바구니" description="부족한 식재료 쿠팡 장보기 및 구매 완료 식재료 냉장고 반영" />
      <CartTab
        cartItems={ctx.cartItems}
        onToggleItem={ctx.toggleCartItem}
        onRemoveItem={ctx.removeCartItem}
        onClearCart={ctx.clearCart}
        onPurchaseComplete={ctx.purchaseComplete}
        onNavigateToFridge={() => navigate('/fridge')}
      />
    </>
  )
}

/* ===================== 라우트 정의 ===================== */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route element={<AppLayout />}>
        <Route index element={<HomeRoute />} />
        <Route path="fridge" element={<FridgeRoute />} />
        <Route path="ocr" element={<OcrRoute />} />
        <Route path="recipe" element={<RecipeRoute />} />
        <Route path="cart" element={<CartRoute />} />
        <Route path="shop" element={<ShopScreen />} />
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
  )
}
