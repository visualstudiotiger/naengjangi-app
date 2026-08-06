import React, { useState } from 'react';
import { Ingredient } from '../types';
import { getDDayInfo } from '../utils/dateUtils';
import { X, Share2, Copy, Check, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShareChallengeModalProps {
  ingredients: Ingredient[];
  onClose: () => void;
}

export const ShareChallengeModal: React.FC<ShareChallengeModalProps> = ({ ingredients, onClose }) => {
  const [copied, setCopied] = useState(false);

  // D-Day 방어 성공 식재료 수 & 추정 절약 금액 계산
  const safeItems = ingredients.filter((i) => getDDayInfo(i.expiryDate).days > 0);
  const urgentSaved = ingredients.filter((i) => {
    const dday = getDDayInfo(i.expiryDate).days;
    return dday >= 0 && dday <= 3;
  }).length;

  const estimatedSavedValue = (safeItems.length * 3500 + urgentSaved * 2000).toLocaleString();

  const shareTitle = `[냉장이] 오늘의 냉장고 파먹기 챌린지 성과! 🥬`;
  const shareText = `냉장고 식재료 ${safeItems.length}개 방어 성공! 절약 금액 ₩${estimatedSavedValue}. 냉장이와 함께 식비를 절약하고 환경을 지켜요!`;
  const shareUrl = window.location.origin;

  const handleShare = async () => {
    try {
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
    } catch {}

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="fade-in"
        style={{
          background: 'var(--card-bg)',
          borderRadius: '28px',
          padding: '24px',
          width: '100%',
          maxWidth: '380px',
          border: '1px solid var(--card-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(0,0,0,0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 12px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 800 }}>
            <Sparkles size={14} /> 냉장고 파먹기 챌린지 성과
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginTop: '8px' }}>오늘의 식재료 방어 성공!</h2>
        </div>

        {/* Share Card Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '20px',
            padding: '20px',
            color: 'white',
            boxShadow: '0 10px 24px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 700 }}>추정 절약 식재료 가치</div>
            <ShieldCheck size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>₩{estimatedSavedValue}</div>

          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
            <div>
              <div style={{ opacity: 0.8 }}>유통기한 방어</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{safeItems.length}개 성공</div>
            </div>
            <div>
              <div style={{ opacity: 0.8 }}>임박재료 소진</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{urgentSaved}개 절약</div>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', opacity: 0.85, textAlign: 'center', marginTop: '2px' }}>
            🌱 냉장이와 함께 버려지는 음식물을 줄였어요!
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={handleShare} className="btn-primary">
            <Share2 size={18} /> SNS / 카카오톡으로 성과 공유하기
          </button>
          <button
            onClick={copyToClipboard}
            style={{
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-main)',
              borderRadius: '16px',
              padding: '10px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
            {copied ? '링크 복사 완료!' : '성과 카드 텍스트 복사'}
          </button>
        </div>
      </div>
    </div>
  );
};
