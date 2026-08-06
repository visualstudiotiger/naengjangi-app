# 냉장이 (naengjangi-app)

냉장고 식재료를 스캔하고, 레시피 추천부터 장보기까지 도와주는 서비스 **냉장이**의 웹 클라이언트.

React + TypeScript + Vite 기반의 모바일 우선 웹앱. 라이트/다크 테마를 지원합니다.

## 디자인 톤

- 에메랄드 그린(`#10b981` · `#059669`)을 기본으로, 오렌지/앰버/로즈 포인트를 쓰는 글래스모피즘 UI
- 그라데이션·부드러운 그림자·라운드가 큰 카드, 데스크톱에서는 폰 프레임 목업으로 표시
- 디자인 토큰은 [`src/index.css`](src/index.css)의 CSS 변수로 관리 (라이트/`.dark-theme` 팔레트)

## 기술 스택

| 영역 | 사용 |
|---|---|
| 프레임워크 | React 19 + Vite |
| 언어 | TypeScript |
| 라우팅 | React Router |
| 스타일 | CSS 변수 (`src/index.css`) + 인라인 스타일 |
| 아이콘 | [lucide-react](https://lucide.dev) · 축하효과 canvas-confetti |
| 인증/DB | Supabase (Auth + Postgres) |
| 린터 | oxlint |
| 배포 | Cloudflare Pages |

## 폴더 구조

```
src/
  index.css           # 디자인 토큰 + 전역 스타일 (라이트/다크)
  App.tsx             # 라우터 + 공통 레이아웃(헤더·탭바·모달·전역 상태)
  components/
    HomeTab / FridgeTab / OcrScanTab / RecipeTab / CartTab   # 메인 탭 화면
    AddIngredientModal   # 재료 추가/편집 모달
    ShopScreen / MyPageScreen / LoginScreen   # 상점·마이·로그인
    NaengjangiCharacter  # 냉장이 캐릭터 SVG
  auth/               # AuthProvider / ProtectedRoute (Supabase Auth)
  lib/supabase.ts     # Supabase 클라이언트 (키 미설정 시 graceful)
  layout/             # 라우트 공유 컨텍스트(재료·장바구니·콩알)
  data/ types/ utils/ # 목데이터·타입·D-day 유틸
public/
  favicon.svg
  _redirects          # Cloudflare Pages SPA fallback
supabase/schema.sql   # profiles/characters + RLS + 가입 트리거
docs/                 # supabase-setup · cloudflare-deploy 가이드
```

> 화면 구성: 홈 · 내 냉장고(재료 CRUD) · 영수증 OCR 스캔 · AI 레시피(모달) · 장바구니(구매→냉장고 반영) · 상점(콩알) · 마이페이지. 재료/장바구니/콩알은 localStorage에 저장됩니다.

## 개발

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
npm run lint     # oxlint
```

## 개발 로드맵 (`09_hybrid_build_plan.md`)

- [x] **① 프론트엔드 토대** — Vite·디자인·전 화면·Cloudflare Pages 배포
- [x] **② 회원가입/로그인** — Supabase Auth(이메일 활성) + 마이페이지 *(구글 OAuth는 대시보드 설정 대기: [docs/supabase-setup.md](docs/supabase-setup.md))*
- [ ] **③ AI 추천** — 식재료 사전 시딩, 영수증 OCR, 레시피 매칭

> UI는 별도 작업본(ai-food-assistant)의 디자인을 베이스로 재구성했습니다 (lucide + 다크모드 + 냉장고 CRUD/OCR/장바구니 플로우). 냉장이 캐릭터·콩알·상점 게이미피케이션과 Supabase 인증·배포를 그 위에 통합.

> **② 활성화:** `.env`에 Supabase 키를 채우고 `supabase/schema.sql`을 실행하면 로그인·마이페이지가 동작합니다.

## 배포 (Cloudflare Pages)

GitHub 저장소와 연동된 Cloudflare Pages 프로젝트로 배포합니다.

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Framework preset:** Vite
