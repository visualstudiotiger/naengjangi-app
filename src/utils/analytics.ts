/**
 * Google Analytics 4 (GA4) & Microsoft Clarity 통합 트래킹 유틸리티.
 * 환경 변수 미설정 시에도 에러 없이 콘솔 모드로 안전하게 작동합니다.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function initAnalytics() {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID;

  // Google Analytics 4 Script 동적 주입
  if (gaId && !document.getElementById('ga-script')) {
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    const dataLayer = (window.dataLayer = window.dataLayer || []);
    window.gtag = function (...args: unknown[]) {
      dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: false });
  }

  // Microsoft Clarity Script 동적 주입
  if (clarityId && !document.getElementById('clarity-script')) {
    const script = document.createElement('script');
    script.id = 'clarity-script';
    script.async = true;
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${clarityId}");
    `;
    document.head.appendChild(script);
  }
}

/** 페이지 뷰 이벤트 기록 */
export function trackPageView(path: string) {
  if (window.gtag) {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    window.gtag('config', gaId, { page_path: path });
  }
}

/** 커스텀 이벤트 기록 유틸리티 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
  if (window.clarity) {
    window.clarity('event', eventName);
  }
}

/** 영수증 OCR 스캔 이벤트 */
export function trackOcrScan(itemCount: number, confidenceMatchCount: number) {
  trackEvent('ocr_scan_completed', {
    item_count: itemCount,
    matched_count: confidenceMatchCount,
  });
}

/** AI 레시피 클릭 이벤트 */
export function trackRecipeClick(recipeId: string, recipeTitle: string, matchRate: number) {
  trackEvent('recipe_click', {
    recipe_id: recipeId,
    recipe_title: recipeTitle,
    match_rate: matchRate,
  });
}

/** 쿠팡 파트너스 링크 클릭 이벤트 */
export function trackCoupangClick(itemName: string) {
  trackEvent('coupang_affiliate_click', {
    item_name: itemName,
  });
}
