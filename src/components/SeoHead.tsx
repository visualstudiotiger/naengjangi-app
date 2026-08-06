import React, { useEffect } from 'react';

interface SeoHeadProps {
  title?: string;
  description?: string;
}

const DEFAULT_TITLE = '냉장이 — AI 냉장고 식재료 관리 & 맞춤 레시피 추천';
const DEFAULT_DESCRIPTION =
  '영수증 스캔으로 식재료 유통기한을 자동 등록하고, 남은 식재료 기반 맞춤 AI 레시피 추천부터 부족한 재료 쿠팡 장보기까지 한 번에!';

export const SeoHead: React.FC<SeoHeadProps> = ({ title, description }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | 냉장이` : DEFAULT_TITLE;
    document.title = fullTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || DEFAULT_DESCRIPTION);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description || DEFAULT_DESCRIPTION);
    }
  }, [title, description]);

  return null;
};
