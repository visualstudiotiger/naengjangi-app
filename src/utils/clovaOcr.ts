/**
 * Naver CLOVA OCR API 또는 Cloudflare Edge Function OCR 서비스 인터페이스
 * 환경 변수 (import.meta.env.VITE_CLOVA_OCR_URL 및 VITE_CLOVA_OCR_KEY) 가 등록되어 있을 때
 * 클라우드 OCR을 사용하고, 미설정 시 브라우저 Tesseract.js로 로컬 폴백합니다.
 */

export interface ClovaOcrResult {
  success: boolean;
  lines: string[];
  error?: string;
}

export async function recognizeWithClovaOcr(file: File | Blob): Promise<ClovaOcrResult> {
  const apiUrl = import.meta.env.VITE_CLOVA_OCR_URL;
  const apiKey = import.meta.env.VITE_CLOVA_OCR_KEY;

  if (!apiUrl || !apiKey) {
    return { success: false, lines: [], error: 'CLOVA OCR API credentials not configured' };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-OCR-SECRET': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`CLOVA OCR HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    // CLOVA OCR response formatting parser
    const fields = data.images?.[0]?.fields || [];
    const lines: string[] = fields
      .map((f: { inferText: string }) => f.inferText?.trim())
      .filter(Boolean);

    return { success: true, lines };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown OCR error';
    return { success: false, lines: [], error: msg };
  }
}
