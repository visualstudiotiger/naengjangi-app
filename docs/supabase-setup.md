# Supabase 연결 가이드 (Phase ②)

로그인·마이페이지 코드는 이미 붙어 있습니다. 아래 4단계를 마치면 바로 동작합니다.

## 1. Supabase 프로젝트 만들기
1. https://supabase.com 에서 로그인 → **New project**
2. 프로젝트 이름 `naengjangi`, DB 비밀번호 설정, 리전은 `Northeast Asia (Seoul)` 권장
3. 생성 완료까지 1~2분 대기

## 2. 키를 .env에 넣기
1. 대시보드 → **Project Settings → API**
2. `Project URL` 과 `anon public` 키를 복사
3. 프로젝트 루트에서 `.env.example` 을 `.env` 로 복사 후 값 채우기:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. 개발 서버 재시작 (`npm run dev`) — 로그인 화면의 "설정 전" 안내가 사라집니다.

## 3. DB 스키마 적용
1. 대시보드 → **SQL Editor → New query**
2. [`supabase/schema.sql`](../supabase/schema.sql) 내용을 붙여넣고 **Run**
3. `profiles`, `characters` 테이블과 회원가입 자동생성 트리거가 만들어집니다.

## 4. 로그인 방식 활성화
### 이메일
- **Authentication → Providers → Email** 켜짐 확인 (기본 켜짐)
- 테스트 단계에서는 **Authentication → Sign In / Providers → Email → Confirm email** 을 잠시 꺼두면 가입 즉시 로그인됩니다.

### 구글 OAuth
1. [Google Cloud Console](https://console.cloud.google.com) → 새 프로젝트 → **API 및 서비스 → OAuth 동의 화면** 구성
2. **사용자 인증 정보 → OAuth 클라이언트 ID(웹)** 생성
   - 승인된 리디렉션 URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. 발급된 **클라이언트 ID/Secret** 을 Supabase → **Authentication → Providers → Google** 에 입력하고 저장
4. 배포 후에는 Supabase → **Authentication → URL Configuration → Site URL** 에 실제 도메인(예: Cloudflare Pages URL)을 등록

## 확인
- `/login` 에서 이메일 회원가입/로그인, "Google로 계속하기" 동작
- 로그인 후 홈 우측 상단 프로필 아이콘 → `/mypage` 접근 가능
- 로그아웃 시 다시 `/login` 으로 보호됨
