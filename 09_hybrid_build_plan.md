# 하이브리드 실행 계획: 커리큘럼 스택 + 냉장이 비즈니스 모델

*업로드된 커리큘럼(Chapter 05, 07~11)의 개발 방식을 채택하되, 냉장이의 기존 비즈니스 모델(무료 앱 + 쿠팡 제휴 수수료)은 유지하는 하이브리드 계획.*

## 1. 확정 사항

- **비즈니스 모델**: 변경 없음. 무료 서비스 + 쿠팡파트너스 제휴 커미션 (`04_business_plan.md` 기준)
- **개발 방식/스택**: 커리큘럼 방식으로 전환 — 혼자서 Claude Code로 빠르게 구축
- **플랫폼 변경(중요)**: 이 스택(Supabase + Cloudflare Pages)은 웹 서비스 전제이므로, 네이티브 모바일 앱(`02_technical_spec.md` 원안)에서 **React 기반 반응형 웹**으로 다시 전환됨. 이전에 "네이티브 앱으로 되돌리기"로 결정했던 것을 이번 결정이 다시 뒤집는 것임을 명시해둠.
- **결제 시스템(Chapter 10)**: 도입 보류. 무료+제휴 모델에는 당장 필요 없음. 추후 프리미엄 기능(예: 고급 레시피 추천, 광고 제거)을 유료화할 계획이 생기면 그때 폴라/스트라이프 연동을 재검토.

## 2. 스택 매핑

| 영역 | 기존 스펙(02_technical_spec.md) | 하이브리드 결정 |
|---|---|---|
| 프론트엔드 | Swift/Kotlin 네이티브 | **React + Vite** |
| 호스팅 | Naver Cloud Platform | **Cloudflare Pages** |
| 백엔드 | Node.js(NestJS)/Spring Boot 직접 운영 | **서버 없음 — Supabase로 대체** |
| DB | PostgreSQL 직접 구축 | **Supabase(관리형 Postgres)** |
| 인증 | OAuth2 직접 구현 | **Supabase Auth + Google OAuth** |
| 이미지 저장 | S3 호환 스토리지 | **Supabase Storage 또는 Cloudflare R2** |
| 영수증 OCR | Naver CLOVA OCR | **유지** — Cloudflare Worker/Supabase Edge Function에서 시크릿 키를 감싸 호출 (클라이언트에 키 노출 방지) |
| 레시피 매칭 3단계 | 사전/유사도/LLM 폴백 | **유지**, LLM 폴백은 OpenAI API로 구현(커리큘럼 9장 방식) |
| 알림 | FCM(네이티브 푸시) | **Web Push API** (웹 전환에 따름) |
| 결제 | 없음 | **없음 — 10장 보류** |
| 분석 | 별도 언급 없음 | **Google Analytics + Microsoft Clarity** (커리큘럼 5장) |

## 3. 실행 순서 (커리큘럼 챕터 → 냉장이 적용 과제)

### ① 프론트엔드 토대 (Ch.09 앞부분)
- React + Vite 새 프로젝트 생성
- Claude Code 설치 및 GitHub 연동
- Cloudflare Pages로 배포 파이프라인 구성
- `03_design_system.md`의 민트/코랄 토큰과 지금까지 만든 화면 톤을 반영해 프런트엔드 화면 구성 시작

### ② 회원가입/로그인 (Ch.11)
- 데이터베이스/스토리지 개념 확인 후 Supabase 프로젝트 생성
- Supabase Auth로 회원가입/로그인 구현
- 구글 OAuth 연동 (구글 클라우드 프로젝트 생성 → OAuth 인증 정보 생성 → Supabase 연동)
- 마이페이지: 캐릭터 정보, 콩알 잔액, 알림 설정 등 `02_technical_spec.md`의 `users`/`characters` 테이블 항목을 마이페이지 기능으로 구현

### ③ AI 추천 시스템 (Ch.09 뒷부분)
- Supabase에 `ingredient_dictionary`(`06_ingredient_dictionary_v1.xlsx` 데이터 시딩), `inventory_items`, `recipes` 등 테이블 구성
- 서버리스(Edge Function)로 CLOVA OCR 호출 → 1·2차 매칭 로직 구현
- 오픈AI API 키 발급 및 보관(Cloudflare Pages 환경변수) → LLM 폴백은 2단계 지표 확인 후 적용

### ④ 도메인 및 검색 노출 (Ch.07)
- 브랜드 도메인 구매, 서비스와 연결
- 파비콘 제작 및 적용 (냉장이 캐릭터 활용)
- SEO: 서비스 설명, 메타 정보 최적화로 검색 노출 극대화
- GEO: AI 검색(챗GPT 등)에서 노출되도록 구조화된 서비스 설명 페이지 준비 — 이전에 "SEO/GEO 준비가 전혀 안 됐다"고 짚었던 갭을 여기서 메움

### ⑤ 데이터 기반 성장 (Ch.05)
- Google Analytics 계정 생성, 태그 활성화
- 확인할 주요 사용자 행동 지표 정의: 영수증 업로드율, 레시피 클릭률, 장바구니 전환율, 챌린지 참여율 등 (`08_project_site.html`에서 강조한 핵심 루프 지표와 연결)
- Microsoft Clarity 연동으로 실제 사용자 행동(클릭/스크롤) 관찰 → 지속적 제품 개선 사이클 구축

### ⑥ 바이럴/퍼포먼스 마케팅 (Ch.08)
- AddToAny 등으로 SNS 공유 기능 추가 — `01_brainstorm_plan.md`의 "냉장고 파먹기 챌린지 비포/애프터 공유 카드" 기능과 직접 연결
- 바이럴 성장 지표(K-팩터) 확인
- 이탈 방지를 위한 사용자 피드백 시스템: Clarity 데이터 + 유저백 등으로 이탈 지점 분석

### ⑦ 글로벌 결제 (Ch.10) — 보류
- 현재 비즈니스 모델에는 불필요
- 추후 프리미엄 유료 기능을 도입하기로 결정되면, 이 챕터를 그때 다시 꺼내 폴라/스트라이프 연동 검토

## 4. 재검토가 필요한 기존 문서

- `02_technical_spec.md`: 플랫폼(네이티브→웹), 백엔드(자체 서버→Supabase), 인프라(Naver Cloud→Cloudflare) 항목이 이 문서의 결정과 충돌하므로 다음 개정 시 하이브리드 스택으로 업데이트 필요
- `05_investor_pitch_deck.pptx`: 기술 스택 관련 슬라이드는 없어 영향 적음
- `08_project_site.html`: 내용 변경 없음(사업/브랜드 소개 중심이라 스택 변경과 무관)

## 5. 다음 단계
1. React + Vite 프로젝트 초기화, Cloudflare Pages 배포까지 먼저 완료 (①)
2. Supabase 프로젝트 생성 및 인증 시스템 구현 (②)
3. ①②가 끝난 뒤 AI 추천 파이프라인 착수 (③)
