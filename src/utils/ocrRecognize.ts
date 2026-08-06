/**
 * 실제 브라우저 OCR (Tesseract.js, 한국어) & CLOVA OCR 듀얼 엔진.
 * 이미지 전처리(Contrast/Binarization) 후 문자를 추출합니다.
 */
import { preprocessImage } from './imagePreprocessor';
import { recognizeWithClovaOcr } from './clovaOcr';

export async function recognizeReceipt(
  file: File | Blob,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  // 1. 이미지 대비 및 휘도 전처리로 OCR 인식률 극대화
  const processedFile = await preprocessImage(file);

  // 2. CLOVA OCR 연동 키가 존재할 경우 클라우드 OCR 우선 시도
  const clovaResult = await recognizeWithClovaOcr(processedFile);
  if (clovaResult.success && clovaResult.lines.length > 0) {
    onProgress?.(1.0);
    return clovaResult.lines;
  }

  // 3. CLOVA 미설정 시 브라우저 Tesseract.js 로컬 OCR 파이프라인 작동
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('kor', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') onProgress?.(m.progress);
    },
  });

  try {
    const { data } = await worker.recognize(processedFile);
    return data.text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  } finally {
    await worker.terminate();
  }
}
