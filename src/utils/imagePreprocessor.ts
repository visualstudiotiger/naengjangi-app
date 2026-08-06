/**
 * 영수증 이미지 전처리 유틸리티 (Canvas 기반)
 * 열전사 영수증의 흐릿한 문자를 선명하게 대비를 높이고 그레이스케일/이진화 처리하여
 * OCR(Tesseract.js) 인식 정확도를 대폭 향상시킵니다.
 */
export async function preprocessImage(file: File | Blob): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // 최대 해상도 1600px 이하로 렌더링하여 OCR 속도 및 핏 유지
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 1600;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // 이미지 픽셀 대비 강화 & 그레이스케일 처리
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 흑백 휘도 계산
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // 대비(Contrast) 극대화 (약 1.4배)
        const contrast = 1.4;
        gray = ((gray - 128) * contrast + 128);
        gray = Math.max(0, Math.min(255, gray));

        // 이진화 (간단한 임계값 적용)
        const threshold = 140;
        const finalColor = gray > threshold ? 255 : 0;

        data[i] = finalColor;
        data[i + 1] = finalColor;
        data[i + 2] = finalColor;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/jpeg',
        0.9
      );
    };

    img.onerror = () => {
      resolve(file);
    };

    img.src = url;
  });
}
