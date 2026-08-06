import React from 'react';
import { Ingredient, Recipe } from '../types';
import { getDDayInfo } from '../utils/dateUtils';
import { Camera, Plus, Utensils, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface HomeTabProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  onNavigateTab: (tab: 'fridge' | 'ocr' | 'recipe' | 'cart') => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenAddIngredientModal: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  ingredients,
  recipes,
  onNavigateTab,
  onSelectRecipe,
  onOpenAddIngredientModal
}) => {
  // Expiring items filter (days <= 3)
  const expiringItems = ingredients
    .map(ing => ({ ...ing, dday: getDDayInfo(ing.expiryDate) }))
    .filter(ing => ing.dday.days <= 3)
    .sort((a, b) => a.dday.days - b.dday.days);

  // Top AI recommended recipe (highest match rate)
  const topRecipe = recipes[0];

  const totalFridge = ingredients.filter(i => i.storage === 'fridge').length;
  const totalFreezer = ingredients.filter(i => i.storage === 'freezer').length;
  const totalPantry = ingredients.filter(i => i.storage === 'pantry').length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Welcome Banner & Summary */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #047857)',
        borderRadius: '24px',
        padding: '22px 20px',
        color: 'white',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-20px',
          opacity: 0.15,
          pointerEvents: 'none'
        }}>
          <Utensils size={160} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            냉장이 AI
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>스마트 식재료 관리</span>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
          냉장고 속에 식재료 <span style={{ color: '#fde047' }}>{ingredients.length}개</span> 보관 중!
        </h2>
        <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '16px', lineHeight: 1.4 }}>
          {expiringItems.length > 0
            ? `⚠️ 유통기한 임박 식재료가 ${expiringItems.length}개 있습니다. 오늘 요리로 해결해 보세요!`
            : '✨ 모든 식재료가 신선하게 보관되고 있습니다.'}
        </p>

        {/* Quick Storage Stats Counter */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.18)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '12px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>🧊 냉장</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{totalFridge}개</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>❄️ 냉동</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{totalFreezer}개</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>📦 실온</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{totalPantry}개</div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚡ 빠른 실행
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => onNavigateTab('ocr')}
            style={{
              padding: '14px',
              borderRadius: '18px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'flex-start',
              boxShadow: '0 6px 16px rgba(59, 130, 246, 0.25)',
              textAlign: 'left'
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px' }}>
              <Camera size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>영수증 OCR 스캔</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>사진 찍고 자동 식재료 등록</div>
            </div>
          </button>

          <button
            onClick={onOpenAddIngredientModal}
            style={{
              padding: '14px',
              borderRadius: '18px',
              border: '1px solid var(--card-border)',
              background: 'var(--card-bg)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'left'
            }}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-600)', padding: '8px', borderRadius: '12px' }}>
              <Plus size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>식재료 직접 추가</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>유통기한 수동 입력</div>
            </div>
          </button>
        </div>
      </div>

      {/* Expiring Ingredients Alert Section */}
      {expiringItems.length > 0 && (
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert color="#ff6b35" size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>유통기한 임박 식재료</span>
              <span style={{
                background: '#ff6b35',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '10px'
              }}>
                {expiringItems.length}
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('fridge')}
              style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              전체보기 <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expiringItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.02)',
                  borderRadius: '12px',
                  borderLeft: '4px solid ' + (item.dday.type === 'expired' ? '#f43f5e' : item.dday.type === 'critical' ? '#ff6b35' : '#f59e0b')
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    수량: {item.quantity} · 위치: {item.storage === 'fridge' ? '냉장' : item.storage === 'freezer' ? '냉동' : '실온'}
                  </div>
                </div>
                <span className={`badge-dday ${item.dday.type}`}>
                  {item.dday.badgeText}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Daily Recipe Recommendation Card */}
      {topRecipe && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles color="#10b981" size={18} /> 오늘 뭐 먹지? AI 추천 레시피
            </h3>
            <button
              onClick={() => onNavigateTab('recipe')}
              style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              레시피 더보기 <ArrowRight size={14} />
            </button>
          </div>

          <div
            onClick={() => onSelectRecipe(topRecipe)}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            <div style={{ position: 'relative', height: '160px' }}>
              <img
                src={topRecipe.imageUrl}
                alt={topRecipe.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(16, 185, 129, 0.95)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 800,
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                🎯 매칭률 {topRecipe.matchRate || 85}%
              </div>
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '12px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '8px',
                fontSize: '0.72rem'
              }}>
                ⏱️ {topRecipe.cookingTime}분 · 난이도: {topRecipe.difficulty}
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>{topRecipe.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {topRecipe.description}
              </p>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {topRecipe.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: ing.inStock ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.1)',
                      color: ing.inStock ? '#059669' : '#dc2626',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    {ing.inStock ? '✓' : '부족'} {ing.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
