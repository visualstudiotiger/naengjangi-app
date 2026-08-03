import { useOutletContext } from 'react-router-dom'

/** AppLayout이 <Outlet context>로 하위 화면에 내려주는 값 */
export type AppOutletContext = {
  beans: number
  purchase: (price: number) => void
  openReceipt: () => void
}

export function useAppContext() {
  return useOutletContext<AppOutletContext>()
}
