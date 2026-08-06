export const getDDayInfo = (expiryDateStr: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `유통기한 만료 (${Math.abs(diffDays)}일 지남)`,
      badgeText: `EXP -${Math.abs(diffDays)}일`,
      type: 'expired' as const,
      days: diffDays
    };
  } else if (diffDays === 0) {
    return {
      text: '오늘 유통기한 만료!',
      badgeText: 'D-Day (오늘)',
      type: 'critical' as const,
      days: 0
    };
  } else if (diffDays === 1) {
    return {
      text: '내일 유통기한 만료',
      badgeText: 'D-1 (내일)',
      type: 'critical' as const,
      days: 1
    };
  } else if (diffDays <= 3) {
    return {
      text: `${diffDays}일 남음`,
      badgeText: `D-${diffDays}`,
      type: 'warning' as const,
      days: diffDays
    };
  } else {
    return {
      text: `${diffDays}일 남음`,
      badgeText: `D-${diffDays}`,
      type: 'safe' as const,
      days: diffDays
    };
  }
};
