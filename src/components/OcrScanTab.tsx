import React, { useState } from 'react';
import { OCRScannedItem, Ingredient, Category, StorageType } from '../types';
import { SAMPLE_OCR_RECEIPTS } from '../data/mockData';
import { Camera, RefreshCw, Sparkles, CheckCircle, Check, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OcrScanTabProps {
  onAddScannedIngredients: (items: Ingredient[]) => void;
  onNavigateToFridge: () => void;
}

export const OcrScanTab: React.FC<OcrScanTabProps> = ({
  onAddScannedIngredients,
  onNavigateToFridge
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<OCRScannedItem[] | null>(null);
  const [receiptName, setReceiptName] = useState<string>('');

  const startScan = (sampleIndex?: number) => {
    setIsScanning(true);
    setScannedItems(null);

    setTimeout(() => {
      const receipt = sampleIndex !== undefined ? SAMPLE_OCR_RECEIPTS[sampleIndex] : SAMPLE_OCR_RECEIPTS[0];
      setReceiptName(receipt.title);

      const items: OCRScannedItem[] = receipt.items.map((item, idx) => ({
        id: `ocr-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category as Category,
        storage: item.storage as StorageType,
        quantity: item.quantity,
        suggestedExpiryDays: item.expiryDays,
        confidence: 0.92 + (idx * 0.01),
        selected: true
      }));

      setScannedItems(items);
      setIsScanning(false);

      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    }, 1800);
  };

  const toggleSelectItem = (id: string) => {
    if (!scannedItems) return;
    setScannedItems(scannedItems.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const updateItemExpiryDays = (id: string, days: number) => {
    if (!scannedItems) return;
    setScannedItems(scannedItems.map(item =>
      item.id === id ? { ...item, suggestedExpiryDays: Math.max(1, days) } : item
    ));
  };

  const handleBatchConfirm = () => {
    if (!scannedItems) return;
    const selected = scannedItems.filter(item => item.selected);
    const today = new Date();

    const newIngredients: Ingredient[] = selected.map(item => {
      const expDate = new Date();
      expDate.setDate(today.getDate() + item.suggestedExpiryDays);

      return {
        id: `ing-ocr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        category: item.category,
        storage: item.storage,
        quantity: item.quantity,
        expiryDate: expDate.toISOString().split('T')[0],
        addedDate: today.toISOString().split('T')[0],
        note: `영수증 OCR 자동등록 (${receiptName})`
      };
    });

    onAddScannedIngredients(newIngredients);
    onNavigateToFridge();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
            AI 영수증 OCR
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>스마트 영수증 식재료 추출</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          구매한 영수증을 촬영하거나 사진을 올리면 AI가 식재료 명, 수량, 추천 유통기한을 자동 파악합니다.
        </p>
      </div>

      {/* Camera / File Scanner Box */}
      {!scannedItems && !isScanning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            onClick={() => startScan(0)}
            style={{
              background: 'var(--card-bg)',
              border: '2px dashed var(--primary-500)',
              borderRadius: '24px',
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
            }}>
              <Camera size={32} />
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>
                영수증 사진 촬영 / 이미지 업로드
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                이마트, 홈플러스, 쿠팡 로켓프레시 등 모든 종이/모바일 영수증 지원
              </div>
            </div>

            <span className="btn-primary" style={{ width: 'auto', padding: '10px 20px', fontSize: '0.85rem' }}>
              <Camera size={18} /> 영수증 촬영하기
            </span>
          </div>

          {/* Quick Preset Samples */}
          <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '18px', border: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} color="#10b981" /> 샘플 영수증으로 빠르게 원클릭 테스트:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {SAMPLE_OCR_RECEIPTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => startScan(idx)}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1px solid var(--card-border)',
                    background: 'rgba(0,0,0,0.02)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={16} color="var(--primary-600)" />
                  <div>
                    <div>{sample.title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      항목 {sample.items.length}개 자동추출
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scanning Laser Animation View */}
      {isScanning && (
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '24px',
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px solid var(--card-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <RefreshCw size={44} style={{ color: 'var(--primary-500)', animation: 'spin 2s linear infinite' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>AI가 영수증 글자를 분석 중입니다...</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              품목 텍스트 인식 ➔ 식재료 카테고리 정규화 ➔ 보관 방식 ➔ 유통기한 예측 중
            </p>
          </div>
        </div>
      )}

      {/* OCR Result Confirmation List */}
      {scannedItems && !isScanning && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-100)',
            padding: '14px 16px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                ✅ AI 영수증 분석 성공 ({receiptName})
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                총 {scannedItems.length}개 품목 인식 완료!
              </div>
            </div>
            <button
              onClick={() => setScannedItems(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              다시 촬영
            </button>
          </div>

          {/* Items Check List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scannedItems.map(item => (
              <OCRRow
                key={item.id}
                item={item}
                onToggle={toggleSelectItem}
                onUpdateDays={updateItemExpiryDays}
              />
            ))}
          </div>

          <button
            onClick={handleBatchConfirm}
            className="btn-primary"
            style={{ marginTop: '8px' }}
          >
            <CheckCircle size={20} /> 선택한 {scannedItems.filter(i => i.selected).length}개 식재료 냉장고에 등록하기
          </button>

        </div>
      )}

    </div>
  );
};

const OCRRow: React.FC<{
  item: OCRScannedItem;
  onToggle: (id: string) => void;
  onUpdateDays: (id: string, days: number) => void;
}> = ({ item, onToggle, onUpdateDays }) => {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: item.selected ? '1px solid var(--primary-500)' : '1px solid var(--card-border)',
        borderRadius: '16px',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: item.selected ? 1 : 0.6,
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => onToggle(item.id)}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '8px',
            border: item.selected ? 'none' : '2px solid var(--card-border)',
            background: item.selected ? 'var(--primary-500)' : 'transparent',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {item.selected && <Check size={16} />}
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.name}</span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '6px' }}>
              {item.quantity}
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {item.category} · {item.storage === 'fridge' ? '냉장' : item.storage === 'freezer' ? '냉동' : '실온'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>추천 유통기한</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => onUpdateDays(item.id, item.suggestedExpiryDays - 1)}
              style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer' }}
            >
              -
            </button>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              +{item.suggestedExpiryDays}일
            </span>
            <button
              onClick={() => onUpdateDays(item.id, item.suggestedExpiryDays + 1)}
              style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: '20px', height: '20px', borderRadius: '4px', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
