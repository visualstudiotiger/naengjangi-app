# Cloudflare Pages 배포 가이드 (GitHub 연동 자동배포)

GitHub 저장소(`visualstudiotiger/naengjangi-app`)와 Cloudflare Pages를 연결하면, `main`에 push할 때마다 자동으로 빌드·배포됩니다.

## 1. Pages 프로젝트 생성
1. https://dash.cloudflare.com 로그인
2. 좌측 **Workers & Pages → Create → Pages → Connect to Git**
3. GitHub 계정 인증(Authorize) 후 **`visualstudiotiger/naengjangi-app`** 선택 → **Begin setup**

## 2. 빌드 설정
| 항목 | 값 |
|---|---|
| Production branch | `main` |
| Framework preset | `Vite` (없으면 `None`) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (기본값) |

> Node 버전은 저장소의 `.nvmrc`(22)로 자동 인식됩니다. 문제가 생기면 아래 env에 `NODE_VERSION=22`를 추가하세요.

## 3. 환경변수 (⚠️ 필수 — 빌드 시점에 주입됨)
**Settings → Environment variables → Production** 에 아래 2개를 추가합니다. Vite는 빌드 때 이 값을 코드에 인라인하므로, **없으면 배포된 앱에서 로그인이 비활성화**됩니다.

| 이름 | 값 |
|---|---|
| `VITE_SUPABASE_URL` | `https://zwtzsskcvubyrhmvhuea.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` (publishable 키) |

> publishable 키는 프론트엔드 공개용이라 Pages 환경변수에 넣어도 안전합니다. (`sb_secret_...`는 넣지 말 것)

## 4. 배포
- **Save and Deploy** → 1~2분 후 `https://naengjangi-app.pages.dev` 형태의 URL 발급
- 이후 `git push` 할 때마다 자동 재배포

## 5. 배포 후 Supabase 연결 마무리
프로덕션 URL이 나오면 Supabase에서 인증 리디렉션을 등록해야 로그인/구글 OAuth가 배포 환경에서 동작합니다.

- Supabase → **Authentication → URL Configuration**
  - **Site URL**: `https://naengjangi-app.pages.dev` (실제 발급 URL)
  - **Redirect URLs**: `https://naengjangi-app.pages.dev/**` 추가

## 확인
- 발급된 URL 접속 → 홈 화면 렌더링
- `/login` 에서 "Supabase 미설정 안내"가 **안 보이면** 환경변수 정상 주입된 것
