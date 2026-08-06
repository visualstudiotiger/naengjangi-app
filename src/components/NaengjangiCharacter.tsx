/**
 * 냉장이 캐릭터 (self-contained SVG)
 * 둥근 도형 · 밝은 얼굴/진한 몸통 · 큰 눈 + 하이라이트 · 코랄 볼터치 · 냉장고 은유.
 * junho 디자인의 에메랄드 톤과 어울리도록 그린 계열 유지.
 */
export function NaengjangiCharacter({ size = 120, title = '냉장이' }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 몸통 */}
      <rect x="24" y="30" width="72" height="78" rx="30" fill="#10b981" />
      {/* 냉장고 내부 은유 */}
      <rect x="40" y="70" width="40" height="30" rx="8" fill="#ffffff" opacity="0.28" />
      <rect x="44" y="84" width="32" height="2.5" rx="1.25" fill="#ffffff" opacity="0.4" />
      {/* 얼굴/머리 */}
      <ellipse cx="60" cy="46" rx="34" ry="30" fill="#5eead4" />
      {/* 볼터치 */}
      <circle cx="42" cy="52" r="6" fill="#fb923c" opacity="0.6" />
      <circle cx="78" cy="52" r="6" fill="#fb923c" opacity="0.6" />
      {/* 눈 */}
      <ellipse cx="49" cy="44" rx="5" ry="6.5" fill="#064e3b" />
      <ellipse cx="71" cy="44" rx="5" ry="6.5" fill="#064e3b" />
      <circle cx="50.6" cy="41.5" r="1.7" fill="#ffffff" />
      <circle cx="72.6" cy="41.5" r="1.7" fill="#ffffff" />
      {/* 입 */}
      <path d="M54 56 Q60 61 66 56" stroke="#064e3b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
