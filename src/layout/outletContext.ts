import { useOutletContext } from 'react-router-dom'
import type { Ingredient, Recipe, CartItem } from '../types'

/** AppLayout이 <Outlet context>로 하위 화면에 내려주는 앱 전역 상태/핸들러 */
export type AppOutletContext = {
  // 데이터
  ingredients: Ingredient[]
  recipes: Recipe[]
  cartItems: CartItem[]
  beans: number

  // 재료
  openAddIngredient: (edit?: Ingredient | null) => void
  saveIngredient: (ingredient: Ingredient) => void
  deleteIngredient: (id: string) => void
  addScanned: (items: Ingredient[]) => void

  // 장바구니
  addToCart: (items: CartItem[]) => void
  toggleCartItem: (id: string) => void
  removeCartItem: (id: string) => void
  clearCart: () => void
  purchaseComplete: (items: Ingredient[]) => void

  // 레시피 모달
  selectedRecipeModal: Recipe | null
  setSelectedRecipeModal: (recipe: Recipe | null) => void

  // 게이미피케이션 (콩알)
  spendBeans: (price: number) => void
  earnBeans: (amount: number) => void
}

export function useAppContext() {
  return useOutletContext<AppOutletContext>()
}
