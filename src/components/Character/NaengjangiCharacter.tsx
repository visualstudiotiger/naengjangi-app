interface NaengjangiCharacterProps {
  size?: number;
  title?: string;
}

/**
 * 냉장이 캐릭터 — 06번 캐릭터 가이드 기반.
 * 둥근 도형, 밝은 얼굴 / 진한 몸통, 큰 눈 + 흰 하이라이트, 코랄 볼터치,
 * 몸통 하단에 반투명 사각형으로 냉장고 내부를 은유.
 */
export function NaengjangiCharacter({ size = 120, title = "냉장이" }: NaengjangiCharacterProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 몸통 (진한 민트, 둥근 사각형) */}
      <rect x="24" y="30" width="72" height="78" rx="30" fill="var(--color-mint-accent)" />
      {/* 냉장고 내부 은유 — 반투명 사각형 + 선반 */}
      <rect x="40" y="70" width="40" height="30" rx="8" fill="#ffffff" opacity="0.28" />
      <rect x="44" y="84" width="32" height="2.5" rx="1.25" fill="#ffffff" opacity="0.4" />
      {/* 얼굴/머리 (밝은 민트) */}
      <ellipse cx="60" cy="46" rx="34" ry="30" fill="var(--color-character-body-light)" />
      {/* 볼터치 (코랄 반투명) */}
      <circle cx="42" cy="52" r="6" fill="var(--color-character-blush)" />
      <circle cx="78" cy="52" r="6" fill="var(--color-character-blush)" />
      {/* 눈 (큰 타원 + 흰 하이라이트) */}
      <ellipse cx="49" cy="44" rx="5" ry="6.5" fill="var(--color-character-eye)" />
      <ellipse cx="71" cy="44" rx="5" ry="6.5" fill="var(--color-character-eye)" />
      <circle cx="50.6" cy="41.5" r="1.7" fill="#ffffff" />
      <circle cx="72.6" cy="41.5" r="1.7" fill="#ffffff" />
      {/* 입 */}
      <path
        d="M54 56 Q60 61 66 56"
        stroke="var(--color-character-eye)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
