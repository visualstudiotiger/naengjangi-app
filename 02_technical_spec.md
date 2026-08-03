# 냉장고 식재료 스캔 & 자동 장보기
*기술 스펙 문서 (Phase 1 MVP 기준)*

## 1. 개요

- 목적: 기획 브레인스토밍 문서에서 정리된 Phase 1(MVP) 범위를 실제 개발에 착수할 수 있는 수준으로 구체화
- 플랫폼: 네이티브 모바일 앱 (iOS / Android)
- 범위: 온보딩, 영수증 인식, 레시피 추천, 장바구니(쿠팡 딥링크), 캐릭터·콩알 기본 시스템, 유통기한 알림
- 범위 제외(Phase 2 이후): 냉장고 사진 인식, 컬리 연동, LLM 폴백 매칭, 인스타그램 요리 대결

## 2. 기술 스택 제안

| 영역 | 제안 |
|---|---|
| 클라이언트 | iOS: Swift + SwiftUI / Android: Kotlin + Jetpack Compose (또는 React Native로 코드 공유 시 개발 리소스 절감 가능) |
| 백엔드 | Node.js(NestJS) 또는 Kotlin(Spring Boot) — REST API 서버 |
| 데이터베이스 | PostgreSQL (관계형 데이터 + 트라이그램 유사도 검색을 위한 pg_trgm 확장 지원) |
| 이미지 저장 | S3 호환 오브젝트 스토리지 (영수증 원본, 냉장고 사진 등) |
| OCR | Naver CLOVA OCR (영수증 특화 모델) |
| 인증 | OAuth2 소셜 로그인 (카카오, 애플, 구글) |
| 푸시 알림 | Firebase Cloud Messaging (iOS/Android 통합) |
| 인프라 | Naver Cloud Platform 권장 (CLOVA OCR과 동일 리전 사용 시 지연시간·데이터 반출 이슈 최소화) |

## 3. 시스템 아키텍처 개요

클라이언트(iOS/Android) → API 서버 → (DB / OCR 외부 API / 쿠팡파트너스 API / FCM) 구조의 단일 백엔드 서비스로 시작. 트래픽이 커지면 영수증 처리·알림 발송을 별도 워커/큐(예: 영수증 OCR 비동기 처리 큐)로 분리하는 것을 고려.

| 구성 요소 | 역할 |
|---|---|
| API 서버 | 인증, 인벤토리·레시피·장바구니·캐릭터·콩알 CRUD, 비즈니스 로직 처리 |
| 영수증 처리 워커 | 업로드된 이미지를 CLOVA OCR로 전송 → 결과를 정규화 파이프라인(7장)에 전달 → 잠정 인벤토리 생성 |
| 알림 스케줄러 | 유통기한 임박 항목을 주기적으로 스캔하여 발송 큐에 적재, 사용자별 알림 빈도 설정 반영 |
| 외부 연동 | CLOVA OCR API, 쿠팡파트너스 딥링크 API, FCM |

## 4. 데이터 모델

핵심 엔티티와 주요 컬럼. 실제 구현 시 세부 타입·제약조건은 ORM 마이그레이션 단계에서 확정.

### users

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `nickname` | varchar | 사용자 닉네임 |
| `notification_pref` | enum | 조용히 / 적당히 / 적극적으로 |
| `notification_time` | time | 기본값 18:00, 설정에서 변경 가능 |
| `currency_balance` | int | 콩알 잔액 (파생 캐시, 원장은 currency_transactions) |
| `created_at` | timestamp | |

### characters

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `user_id` | uuid (FK) | users 참조, 1:1 |
| `type` | enum | 캐릭터 4종 중 선택 |
| `name` | varchar | 사용자 지정 이름 (선택) |
| `growth_stage` | enum | 아기/어린이/청소년/20~30대/40~50대 — 단조 증가, 역행 없음 |
| `condition_score` | int | 최근 활동 기반 가변 지표, 표정/텐션에 반영 |

### character_items

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `character_id` | uuid (FK) | |
| `item_id` | uuid (FK) | items 참조 |
| `equipped` | boolean | 현재 착용 여부 |
| `status` | enum | active / retired_to_album — 성장 단계 초과 시 retired 처리 |
| `acquired_at` | timestamp | |

### items

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `slot` | enum | 머리/얼굴, 몸/의상, 배경, 소품·이펙트 |
| `stage_requirement` | enum | 착용 가능 성장 단계 |
| `price` | int | 콩알 가격 (null이면 구매 불가, 활동 전용) |
| `source_type` | enum | shop / streak_milestone / event_limited |

### ingredient_dictionary

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `standard_name` | varchar | 표준 식재료명 (예: 닭가슴살) |
| `category` | enum | 채소/육류/유제품/조미료 등 |
| `aliases` | text[] | 매칭용 이표기 목록 |
| `default_expiry_days` | int | 카테고리 기반 유통기한 기본값 |

### inventory_items

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `user_id` | uuid (FK) | |
| `ingredient_id` | uuid (FK, null 허용) | 매칭 실패 시 null, raw_text만 존재 |
| `raw_text` | varchar | OCR 원문 |
| `match_confidence` | enum | high / medium / low — UI 태그 색상과 매핑 |
| `expiry_date` | date | |
| `source` | enum | receipt / manual |

### recipes / recipe_ingredients
- **recipes:** `id`, `name`, `category`, `image_url`, `instructions`
- **recipe_ingredients:** `recipe_id`, `ingredient_id`, `required_quantity`, `is_essential` (필수/선택 재료 구분 — 부분 매칭 로직에서 사용)

### cart_items

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `user_id` | uuid (FK) | |
| `ingredient_id` | uuid (FK) | 여러 레시피에서 겹치면 합산 표시 |
| `quantity_needed` | int | |
| `coupang_deeplink` | varchar | 생성된 딥링크 URL (캐싱) |

### currency_transactions

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `user_id` | uuid (FK) | |
| `amount` | int | 양수: 획득, 음수: 사용 |
| `type` | enum | earn_receipt / earn_streak / spend_shop / refund_retired_item |
| `created_at` | timestamp | |

### notifications

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `user_id` | uuid (FK) | |
| `type` | enum | expiry_alert / recipe_suggestion / condition_nudge |
| `scheduled_at` | timestamp | |
| `sent_at` | timestamp | |

## 5. API 설계 (Phase 1 범위)

| Method | Path | 설명 |
|---|---|---|
| POST | `/auth/login` | 소셜 로그인 |
| POST | `/onboarding/character` | 캐릭터 선택, 이름, 알림 빈도 설정 |
| POST | `/receipts` | 영수증 이미지 업로드 → 비동기 OCR 처리 시작 |
| GET | `/receipts/{id}` | 처리 상태 및 잠정 인식 결과 조회 |
| PATCH | `/inventory/items/{id}` | 인식 결과 수정 (태그 탭 수정) |
| POST | `/inventory/items` | 수동 재료 추가 |
| GET | `/recipes?tab=` | recommended(부분매칭) / available(완전매칭) / expiring(유통기한 임박) |
| POST | `/cart/items` | 부족 재료 장바구니 담기 |
| GET | `/cart` | 장바구니 조회 (재료별 합산) |
| GET | `/cart/items/{id}/deeplink` | 쿠팡 딥링크 조회/생성 |
| GET | `/character` | 캐릭터 상태 조회 |
| PATCH | `/character/equip` | 아이템 착용/해제 |
| GET | `/shop/items` | 상점 아이템 목록 (성장 단계 필터링) |
| POST | `/shop/purchase` | 아이템 구매 |
| GET | `/currency/transactions` | 콩알 내역 조회 |
| GET | `/notifications` | 알림함 조회 |
| PATCH | `/users/me/notification-pref` | 알림 빈도/시간 설정 변경 |

### 요청/응답 예시: 영수증 업로드

```
POST /receipts
Content-Type: multipart/form-data
{ image: <file> }

→ 202 Accepted
{ "receipt_id": "uuid", "status": "processing" }

GET /receipts/{id}
→ 200 OK
{
  "status": "done",
  "items": [
    { "raw_text": "하림닭가슴살500G", "matched_name": "닭가슴살", "confidence": "high" },
    { "raw_text": "순두부1EA", "matched_name": null, "confidence": "low" }
  ]
}
```

## 6. 외부 연동 상세

### Naver CLOVA OCR
- 인증: API Gateway 도메인별 발급 Secret Key + Invoke URL 사용
- 영수증 특화 모델 사용, 응답에서 상호명·구매일시·품목·수량·금액 필드 추출
- 에러 처리: 흐릿한 이미지 등으로 인식 실패 시 재촬영 안내 UI로 연결

### 쿠팡파트너스
- HMAC 인증 방식의 딥링크 API 사용, subId로 화면별 클릭 추적
- 검색 API는 호출 제한이 있으므로 실시간 검색 대신 인기 재료 기준 캐싱 전략 사용
- 장바구니 화면에 고지 문구("쿠팡 파트너스 활동으로 일정 수수료를 제공받습니다") 고정 노출
- 최종 승인(API 사용) 전까지는 일반 상품 URL 기반 링크로 운영 시작, 승인 후 딥링크 API로 전환

## 7. 영수증 → 식재료명 정규화 파이프라인 (기술 상세)

- 1차 사전 매칭: `ingredient_dictionary.aliases` 대상 정확/부분 문자열 일치 (PostgreSQL pg_trgm 확장 활용 가능)
- 2차 유사도 매칭: 레벤슈타인 편집거리 또는 자소 단위 유사도로 근접 매칭, 임계값 이상일 때만 채택
- 매칭 결과에 confidence(high/medium/low) 부여 → `match_confidence` 컬럼에 저장 → 클라이언트 태그 색상에 반영
- 두 단계 모두 실패 시 `ingredient_id`는 null로 두고 `raw_text`만 저장, 클라이언트에서 수동 입력 유도
- 사용자가 태그를 수정하면 해당 raw_text-standard_name 매핑을 보정 후보로 로깅 → 주기적으로 사전에 반영 (수동 검수 후 반영 권장)

## 8. 알림 시스템

- 배치 스케줄러가 주기적으로(예: 매일 1회) `inventory_items`의 `expiry_date`를 스캔하여 임박 항목 추출
- 사용자별 `notification_pref`(조용히/적당히/적극적으로)에 따라 발송 빈도 제어, `notification_time` 기준으로 발송 시각 조정
- FCM으로 발송, `notifications` 테이블에 발송 이력 기록

## 9. 보안 및 개인정보 고려사항

- 영수증 이미지에 카드번호 일부 등 민감 정보가 포함될 수 있음 — OCR 처리 후 원본 이미지의 보관 기간을 정책적으로 제한하거나 민감 영역 마스킹 처리 검토
- 개인정보처리방침에 영수증 이미지 수집·이용 목적, 보관 기간, 제3자 제공(OCR API 등) 내역 명시 필요
- 쿠팡파트너스 등 제휴 링크 클릭 시 개인 식별 정보가 URL 파라미터에 포함되지 않도록 처리

## 10. Phase 1 개발 체크리스트

- [ ] 쿠팡파트너스 가입 및 활동 채널 등록
- [ ] 표준 식재료 사전 v1 구축 (상위 500~1000개)
- [ ] CLOVA OCR 연동 및 영수증 업로드 파이프라인 구현
- [ ] 1·2차 매칭 로직 구현
- [ ] 온보딩(캐릭터 선택/이름/알림 설정) 구현
- [ ] 레시피 부분/완전 매칭 로직 및 탭 UI 구현
- [ ] 장바구니 및 쿠팡 딥링크 연동 (고지 문구 포함)
- [ ] 콩알 획득·저가 상점 아이템 기본 로직 구현
- [ ] 유통기한 임박 알림 스케줄러 구현
