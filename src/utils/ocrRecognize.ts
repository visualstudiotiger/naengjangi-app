/**
 * 실제 브라우저 OCR (Tesseract.js, 한국어).
 * 사진 → 텍스트 줄 배열. 무거운 라이브러리라 동적 import로 지연 로딩한다.
 * 정확도가 더 필요하면 추후 CLOVA OCR(Edge Function)로 교체.
 */
export async function recognizeReceipt(
  file: File | Blob,
  onProgress?: (progress: number) => void,
): Promise<string[]> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('kor', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') onProgress?.(m.progress)
    },
  })
  try {
    const { data } = await worker.recognize(file)
    return data.text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  } finally {
    await worker.terminate()
  }
}
