# 냉장이 (naengjangi-app) — Antigravity 프로젝트 가이드

이 문서는 Antigravity AI 코딩 에이전트가 **냉장이 (naengjangi-app)** 프로젝트를 일관되게 개발하고 확장하기 위한 프로젝트 전용 개발 규칙 및 지침서입니다.

---

## 1. 프로젝트 개요 (Project Overview)

- **서비스명**: 냉장이 (naengjangi-app)
- **설명**: 냉장고 식재료를 스캔 및 관리하고, 보유 식재료 기반 AI 레시피 추천과 쿠팡 장보기까지 연결하는 모바일 우선 웹 서비스.
- **핵심 기술 스택**:
  - **Front-End**: React 19 + TypeScript + Vite + React Router (v7)
  - **Styling**: CSS 변수 (`src/index.css`) + 글래스모피즘(Glassmorphism) UI + 라이트/다크 테마
  - **Icons & FX**: Lucide React + Canvas Confetti
  - **Back-End / Auth**: Supabase (Auth + Postgres DB)
  - **Deployment**: Cloudflare Pages
  - **Linter**: oxlint

---

## 2. 프로젝트 로드맵 현황 (`09_hybrid_build_plan.md` 기준)

- [x] **Phase 1: 프론트엔드 토대 & 전 화면 구축** (홈, 내 냉장고, OCR 스캔, AI 레시피, 장바구니, 상점, 마이페이지, 로그인 모달)
- [x] **Phase 2: 인증/회원가입 기반 마련** (`src/auth/AuthProvider.tsx`, `src/lib/supabase.ts`, Supabase Auth 연동)
- [ ] **Phase 3: AI 추천 시스템 & OCR 연동**
  - Supabase `ingredient_dictionary` DB 시딩
  - CLOVA OCR / Cloudflare Worker 연동 (영수증 스캔 실 데이터 매칭)
  - OpenAI API 기반 레시피 추천 폴백
- [ ] **Phase 4: SEO / GEO & 도메인 최적화**
- [ ] **Phase 5: 행동 분석 (Google Analytics + MS Clarity 연동)**

---

## 3. 디자인 시스템 & 개발 규칙

1. **디자인 변수 사용**:
   - `src/index.css`에 선언된 CSS 변수를 활용합니다.
   - 메인 키 컬러: 에메랄드 그린 (`#10b981`, `#059669`)
   - 포인트 컬러: 오렌지 (`#f97316`), 앰버 (`#f59e0b`), 로즈 (`#f43f5e`)
   - 다크 모드: `.dark-theme` 클래스 기준 토큰 변수 대응

2. **코드 품질 및 빌드 검증**:
   - 코드 수정 완료 후 항상 `npm run build` (`tsc -b && vite build`)를 통해 타입 오류가 없는지 확인합니다.
   - `npm run lint` (`oxlint`) 실행 시 경고(Warning)와 에러(Error)가 0개여야 합니다.

3. **Supabase 핸들링**:
   - `.env`에 Supabase URL 및 Key가 설정되지 않은 환경에서도 UI가 멈추지 않고 LocalStorage 기반으로 안전하게 작동하는 Graceful Fallback 구조를 유지해야 합니다. (`src/lib/supabase.ts` 참고)

---

## 4. 자주 사용하는 명령어 (Commands)

```bash
# 로컬 개발 서버 실행
npm run dev

# 타입체크 & 프로덕션 빌드 (필수 검증)
npm run build

# oxlint 코드 린트 검증
npm run lint

# 빌드 결과 미리보기
npm run preview
```
