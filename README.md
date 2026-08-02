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
| 스타일 | CSS 변수 (`src/styles/tokens.css`) + CSS Modules |
| 아이콘 | [@tabler/icons-react](https://tabler.io/icons) (outline) |
| 배포 | Cloudflare Pages |

## 폴더 구조

```
src/
  styles/
    tokens.css        # 디자인 토큰 (색/타이포/형태/여백)
    global.css        # reset + 전역 기본 스타일
  components/
    Button/           # Primary(코랄) / Secondary
    Badge/            # 신뢰도·긴급도 3색(민트/뉴트럴/코랄) 상태 배지
    Card/             # 흰 배경 + 0.5px 테두리 (그림자 미사용)
    Character/        # 냉장이 캐릭터 SVG
    BottomNav/        # 하단 탭바 (홈/레시피/장바구니/상점)
  App.tsx             # 홈 화면 스캐폴드 (목업 데이터)
public/
  favicon.svg
  _redirects          # Cloudflare Pages SPA fallback
```

## 개발

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
```

## 배포 (Cloudflare Pages)

GitHub 저장소와 연동된 Cloudflare Pages 프로젝트로 배포합니다.

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Framework preset:** Vite
