import React, { useState } from 'react';
import { OCRScannedItem, Ingredient } from '../types';
import { SAMPLE_RECEIPT_TEXTS } from '../data/mockData';
import { scanReceiptLines } from '../utils/ocrToIngredient';
import { Camera, RefreshCw, Sparkles, CheckCircle, Check, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OcrScanTabProps {
  onAddScannedIngredients: (items: Ingredient[]) => void;
  onNavigateToFridge: () => void;
}

/** 신뢰도 → 배지 스타일 (03_design_system.md 3색 규칙: 확실/애매/확인필요) */
const CONFIDENCE_BADGE: Record<OCRScannedItem['matchConfidence'], { cls: string; label: string }> = {
  high: { cls: 'safe', label: 'AI 정확' },
  medium: { cls: 'warning', label: '확인 권장' },
  low: { cls: 'critical', label: '직접 확인' },
};

export const OcrScanTab: React.FC<OcrScanTabProps> = ({ onAddScannedIngredients, onNavigateToFridge }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<OCRScannedItem[] | null>(null);
  const [receiptName, setReceiptName] = useState<string>('');

  const startScan = (sampleIndex = 0) => {
    setIsScanning(true);
    setScannedItems(null);
    setTimeout(() => {
      const receipt = SAMPLE_RECEIPT_TEXTS[sampleIndex] ?? SAMPLE_RECEIPT_TEXTS[0];
      setReceiptName(receipt.title);
      setScannedItems(scanReceiptLines(receipt.lines));
      setIsScanning(false);
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      } catch {
        /* noop */
      }
    }, 1600);
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
          영수증 원문을 식재료 사전(179종)과 대조해 표준 이름·유통기한을 자동 매칭하고, 애매한 항목만 검토하도록 표시합니다.
        </p>
      </div>

      {!scannedItems && !isScanning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            onClick={() => startScan(0)}
            style={{ background: 'var(--card-bg)', border: '2px dashed var(--primary-500)', borderRadius: '24px', padding: '36px 20px', textAlign: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)' }}>
              <Camera size={32} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>영수증 사진 촬영 / 이미지 업로드</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>이마트, 홈플러스, 쿠팡 로켓프레시 등 모든 종이/모바일 영수증 지원</div>
            </div>
            <span className="btn-primary" style={{ width: 'auto', padding: '10px 20px', fontSize: '0.85rem' }}>
              <Camera size={18} /> 영수증 촬영하기
            </span>
          </div>

          <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '18px', border: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} color="#10b981" /> 샘플 영수증으로 매칭 엔진 테스트:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {SAMPLE_RECEIPT_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => startScan(idx)}
                  style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.02)', fontSize: '0.78rem', fontWeight: 700, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileText size={16} color="var(--primary-600)" />
                  <div>
                    <div>{sample.title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>원문 {sample.lines.length}줄</div>
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
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>영수증 원문을 식재료 사전과 대조 중…</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>텍스트 정규화 ➔ 사전 매칭 ➔ 자소 유사도 ➔ 유통기한 예측</p>
          </div>
        </div>
      )}

      {scannedItems && !isScanning && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', padding: '14px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700 }}>✅ 매칭 완료 ({receiptName})</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                정확 {matchedCount}개{reviewCount > 0 ? ` · 검토 필요 ${reviewCount}개` : ''}
              </div>
            </div>
            <button onClick={() => setScannedItems(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
              다시 촬영
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
