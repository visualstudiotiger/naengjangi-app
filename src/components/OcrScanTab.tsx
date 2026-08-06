import React, { useRef, useState } from 'react';
import { OCRScannedItem, Ingredient } from '../types';
import { SAMPLE_RECEIPT_TEXTS } from '../data/mockData';
import { scanReceiptLines, filterItemLines } from '../utils/ocrToIngredient';
import { recognizeReceipt } from '../utils/ocrRecognize';
import { Camera, RefreshCw, Sparkles, CheckCircle, Check, FileText, Image as ImageIcon, X, Video } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OcrScanTabProps {
  onAddScannedIngredients: (items: Ingredient[]) => void;
  onNavigateToFridge: () => void;
}

/** 신뢰도 → 배지 스타일 */
const CONFIDENCE_BADGE: Record<OCRScannedItem['matchConfidence'], { cls: string; label: string }> = {
  high: { cls: 'safe', label: 'AI 정확' },
  medium: { cls: 'warning', label: '확인 권장' },
  low: { cls: 'critical', label: '직접 확인' },
};

export const OcrScanTab: React.FC<OcrScanTabProps> = ({ onAddScannedIngredients, onNavigateToFridge }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<OCRScannedItem[] | null>(null);
  const [receiptName, setReceiptName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('영수증 이미지를 준비 중…');
  
  // 카메라 실시간 모달 상태
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const finish = (items: OCRScannedItem[], label: string, imgUrl?: string) => {
    setReceiptName(label);
    if (imgUrl) setPreviewUrl(imgUrl);
    setScannedItems(items);
    setIsScanning(false);
    if (items.some((i) => i.matchConfidence === 'high')) {
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      } catch {
        /* noop */
      }
    }
  };

  /** 실제 사진 → 전처리 & OCR → 매칭 */
  const handleFile = async (file: File) => {
    setError(null);
    setProgress(0);
    setStatusText('이미지 전처리 및 OCR 엔진 실행 중…');
    setScannedItems(null);
    setIsScanning(true);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const lines = await recognizeReceipt(file, (p) => {
        setProgress(p);
        setStatusText('영수증 글자 인식 중…');
      });
      const items = scanReceiptLines(filterItemLines(lines));
      if (items.length === 0) {
        setIsScanning(false);
        setError('식재료를 찾지 못했어요. 사진이 선명한지 확인하거나 직접 추가해 주세요.');
        return;
      }
      finish(items, '내 영수증 사진', objectUrl);
    } catch {
      setIsScanning(false);
      setError('인식에 실패했어요. 다시 시도하거나 샘플로 확인해 주세요.');
    }
  };

  /** 드래그앤드롭 파일 처리 */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  /** 웹캠 라이브 촬영 모달 오픈 */
  const openCamera = async () => {
    try {
      setShowCameraModal(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setShowCameraModal(false);
      setError('카메라 권한을 얻을 수 없습니다. 파일 업로드 기능을 이용해 주세요.');
    }
  };

  /** 웹캠 사진 캡처 */
  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      stopCamera();
      if (blob) {
        const file = new File([blob], 'camera-receipt.jpg', { type: 'image/jpeg' });
        handleFile(file);
      }
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setShowCameraModal(false);
  };

  /** 샘플 텍스트 시연 */
  const startSampleScan = (sampleIndex = 0) => {
    setError(null);
    setIsScanning(true);
    setScannedItems(null);
    setPreviewUrl(null);
    setStatusText('샘플 영수증 원문을 매칭 중…');
    setProgress(0);
    setTimeout(() => {
      const receipt = SAMPLE_RECEIPT_TEXTS[sampleIndex] ?? SAMPLE_RECEIPT_TEXTS[0];
      finish(scanReceiptLines(receipt.lines), `${receipt.title} (샘플)`);
    }, 900);
  };

  const patch = (id: string, next: Partial<OCRScannedItem>) =>
    setScannedItems((prev) => prev?.map((it) => (it.id === id ? { ...it, ...next } : it)) ?? null);

  const handleBatchConfirm = () => {
    if (!scannedItems) return;
    const today = new Date();
    const newIngredients: Ingredient[] = scannedItems
      .filter((i) => i.selected)
      .map((item) => {
        const exp = new Date();
        exp.setDate(today.getDate() + item.suggestedExpiryDays);
        return {
          id: `ing-ocr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: item.name,
          category: item.category,
          storage: item.storage,
          quantity: item.quantity,
          expiryDate: exp.toISOString().split('T')[0],
          addedDate: today.toISOString().split('T')[0],
          note: `영수증 OCR 자동등록 (${receiptName})`,
        };
      });
    onAddScannedIngredients(newIngredients);
    onNavigateToFridge();
  };

  const matchedCount = scannedItems?.filter((i) => i.matchConfidence === 'high').length ?? 0;
  const reviewCount = (scannedItems?.length ?? 0) - matchedCount;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
            AI 영수증 OCR
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>스마트 영수증 식재료 추출</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          영수증 이미지를 업로드하면 전처리 필터 + 식재료 사전(179종) 기반으로 식재료와 유통기한을 자동 추출합니다.
        </p>
      </div>

      {!scannedItems && !isScanning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ background: 'var(--card-bg)', border: '2px dashed var(--primary-500)', borderRadius: '24px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
          >
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)' }}>
              <Camera size={30} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>영수증 사진 촬영 / 드래그 업로드</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>영수증 사진을 끌어다 놓거나 클릭하여 선택하세요</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="btn-primary"
                style={{ width: 'auto', padding: '8px 16px', fontSize: '0.8rem' }}
              >
                <ImageIcon size={16} /> 사진 업로드
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openCamera();
                }}
                style={{ background: 'var(--card-bg)', border: '1px solid var(--primary-500)', color: 'var(--primary-600)', borderRadius: '14px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Video size={16} /> 실시간 촬영
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', color: '#e11d48', padding: '12px 14px', borderRadius: '14px', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}

          <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '18px', border: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} color="#10b981" /> 빠른 테스트용 샘플 영수증 원문:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {SAMPLE_RECEIPT_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => startSampleScan(idx)}
                  style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.02)', fontSize: '0.78rem', fontWeight: 700, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileText size={16} color="var(--primary-600)" />
                  <div>
                    <div>{sample.title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>샘플 원문 {sample.lines.length}줄</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <div style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '40px 20px', textAlign: 'center', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RefreshCw size={44} style={{ color: 'var(--primary-500)', animation: 'spin 2s linear infinite' }} />
          <div style={{ width: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{statusText}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>이미지 전처리 ➔ OCR 텍스트 추출 ➔ 식재료 사전 매칭</p>
            {progress > 0 && (
              <div style={{ marginTop: '14px', height: '8px', background: 'var(--card-border)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(progress * 100)}%`, height: '100%', background: 'var(--primary-500)', borderRadius: '999px', transition: 'width 0.2s ease' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {scannedItems && !isScanning && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 이미지 미리보기 썸네일 */}
          {previewUrl && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--card-bg)', padding: '10px 14px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <img src={previewUrl} alt="Receipt Preview" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--card-border)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>스캔한 영수증 이미지</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{receiptName}</div>
              </div>
            </div>
          )}

          <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '14px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700 }}>✅ 매칭 완료 ({receiptName})</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                정확 {matchedCount}개{reviewCount > 0 ? ` · 검토 필요 ${reviewCount}개` : ''}
              </div>
            </div>
            <button onClick={() => setScannedItems(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
              다시 스캔
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scannedItems.map((item) => (
              <OCRRow key={item.id} item={item} onPatch={patch} />
            ))}
          </div>

          <button onClick={handleBatchConfirm} className="btn-primary" style={{ marginTop: '8px' }}>
            <CheckCircle size={20} /> 선택한 {scannedItems.filter((i) => i.selected).length}개 식재료 냉장고에 등록하기
          </button>
        </div>
      )}

      {/* 웹캠 실시간 촬영 모달 */}
      {showCameraModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', borderRadius: '20px', overflow: 'hidden', border: '2px solid var(--primary-500)' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 'auto', display: 'block' }} />
            <button onClick={stopCamera} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
          </div>
          <p style={{ color: 'white', fontSize: '0.82rem', marginTop: '12px' }}>영수증을 사각형 프레임에 맞춰 촬영하세요</p>
          <button onClick={captureCameraPhoto} className="btn-primary" style={{ marginTop: '16px', width: 'auto', padding: '12px 28px', fontSize: '0.95rem' }}>
            <Camera size={20} /> 사진 캡처 및 OCR 스캔
          </button>
        </div>
      )}
    </div>
  );
};

const OCRRow: React.FC<{ item: OCRScannedItem; onPatch: (id: string, next: Partial<OCRScannedItem>) => void }> = ({ item, onPatch }) => {
  const badge = CONFIDENCE_BADGE[item.matchConfidence];
  const showRaw = item.rawText !== item.name;
  return (
    <div style={{ background: 'var(--card-bg)', border: item.selected ? '1px solid var(--primary-500)' : '1px solid var(--card-border)', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px', opacity: item.selected ? 1 : 0.6 }}>
      <button
        onClick={() => onPatch(item.id, { selected: !item.selected })}
        style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px', borderRadius: '8px', border: item.selected ? 'none' : '2px solid var(--card-border)', background: item.selected ? 'var(--primary-500)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {item.selected && <Check size={16} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <input
            value={item.name}
            onChange={(e) => onPatch(item.id, { name: e.target.value })}
            style={{ fontWeight: 700, fontSize: '0.92rem', border: 'none', borderBottom: '1px dashed var(--card-border)', background: 'transparent', color: 'var(--text-main)', padding: '2px 0', width: 'auto', maxWidth: '140px' }}
          />
          <span className={`badge-dday ${badge.cls}`} style={{ borderRadius: '8px' }}>{badge.label}</span>
          <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '6px' }}>{item.quantity}</span>
        </div>
        {showRaw && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '3px' }}>원문: {item.rawText}</div>
        )}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {item.category} · {item.storage === 'fridge' ? '냉장' : item.storage === 'freezer' ? '냉동' : '실온'}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>유통기한</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => onPatch(item.id, { suggestedExpiryDays: Math.max(1, item.suggestedExpiryDays - 1) })} style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-600)' }}>+{item.suggestedExpiryDays}일</span>
          <button onClick={() => onPatch(item.id, { suggestedExpiryDays: item.suggestedExpiryDays + 1 })} style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
        </div>
      </div>
    </div>
  );
};
