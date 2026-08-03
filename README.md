# 냉장이 (naengjangi-app)

냉장고 식재료를 스캔하고, 레시피 추천부터 장보기까지 도와주는 서비스 **냉장이**의 웹 클라이언트.

React + TypeScript + Vite 기반이며, 스타일은 CSS 변수 + CSS Modules로 관리합니다.

## 브랜드 톤

- **민트**(`#0F6E56` · `#5DCAA5` · `#EAF0E2`)를 기본 톤으로, **코랄**(`#D85A30` · `#FBE9E3`)을 포인트로 8:2 비율 유지
- 색상·타이포·형태 등 모든 디자인 토큰은 기획 문서 `03_design_system.md`를 기준으로 하며,
  `src/styles/tokens.css`에 CSS 변수로 1:1 매핑되어 있습니다.

## 기술 스택

| 영역 | 사용 |
|---|---|
| 프레임워크 | React 19 + Vite |
| 언어 | TypeScript |
| 라우팅 | React Router |
| 스타일 | CSS 변수 (`src/styles/tokens.css`) + CSS Modules |
| 아이콘 | [@tabler/icons-react](https://tabler.io/icons) (outline) |
| 인증/DB | Supabase (Auth + Postgres) |
| 린터 | oxlint |
| 배포 | Cloudflare Pages |

## 폴더 구조

```
src/
  styles/
    tokens.css        # 디자인 토큰 (색/타이포/형태/여백)
    global.css        # reset + 전역 기본 스타일
  components/
    Button/ Badge/ Card/ Character/ BottomNav/   # 공용 UI (CSS Modules)
  screens/
    HomeScreen/       # 홈 (캐릭터·추천 레시피·영수증 업로드)
    RecipesScreen/    # 레시피 3탭 (추천/만들 수 있는/임박)
    CartScreen/       # 장바구니 (재료 합산·쿠팡 링크)
    ShopScreen/       # 상점 (콩알로 아이템 구매·성장 단계 잠금)
    ReceiptFlow/      # 영수증 업로드 모달
    LoginScreen/      # 로그인·회원가입 (이메일 + Google OAuth)
    MyPageScreen/     # 마이페이지 (캐릭터·콩알·알림 설정)
  auth/               # AuthProvider / ProtectedRoute (Supabase Auth)
  lib/supabase.ts     # Supabase 클라이언트 (키 미설정 시 graceful)
  layout/             # 라우트 공유 컨텍스트(콩알·영수증 모달)
  App.tsx             # 라우터 + 공통 레이아웃
public/
  favicon.svg
  _redirects          # Cloudflare Pages SPA fallback
supabase/schema.sql   # profiles/characters + RLS + 가입 트리거
docs/supabase-setup.md# Supabase 연결 가이드
```

## 개발

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
npm run lint     # oxlint
```

## 개발 로드맵 (`09_hybrid_build_plan.md`)

- [x] **① 프론트엔드 토대** — Vite·디자인 시스템·화면(홈/레시피/장바구니/상점/영수증)
- [~] **② 회원가입/로그인** — Supabase Auth + Google OAuth, 마이페이지 *(코드 완료 · 연결 대기: [docs/supabase-setup.md](docs/supabase-setup.md))*
- [ ] **③ AI 추천** — 식재료 사전 시딩, CLOVA OCR, 레시피 매칭

> **② 활성화:** `.env`에 Supabase 키를 채우고 `supabase/schema.sql`을 실행하면 로그인·마이페이지가 동작합니다.

## 배포 (Cloudflare Pages)

GitHub 저장소와 연동된 Cloudflare Pages 프로젝트로 배포합니다.

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Framework preset:** Vite
