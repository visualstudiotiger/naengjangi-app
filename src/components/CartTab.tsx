import React from 'react';
import { CartItem, Ingredient } from '../types';
import { ExternalLink, Trash2, CheckCircle2, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartTabProps {
  cartItems: CartItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onPurchaseComplete: (ingredients: Ingredient[]) => void;
  onNavigateToFridge: () => void;
}

export const CartTab: React.FC<CartTabProps> = ({
  cartItems,
  onToggleItem,
  onRemoveItem,
  onClearCart,
  onPurchaseComplete,
  onNavigateToFridge
}) => {
  const selectedItems = cartItems.filter(item => item.checked);
  const totalPrice = selectedItems.reduce((acc, item) => acc + item.estimatedPrice, 0);

  const handlePurchaseAndAddToFridge = () => {
    if (selectedItems.length === 0) return;

    const today = new Date();

    const newIngredients: Ingredient[] = selectedItems.map((item, idx) => {
      const expDate = new Date();
      expDate.setDate(today.getDate() + 7);

      return {
        id: `ing-cart-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category || '기타',
        storage: 'fridge',
        quantity: item.quantity,
        expiryDate: expDate.toISOString().split('T')[0],
        addedDate: today.toISOString().split('T')[0],
        note: `쿠팡 딥링크 장보기 완료 (출처: ${item.recipeOrigin || '장바구니'})`
      };
    });

    onPurchaseComplete(newIngredients);

    try {
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    onNavigateToFridge();
  };

  const batchCoupangUrl = 'https://www.coupang.com/np/search?q=' + encodeURIComponent(selectedItems.map(i => i.name).join(' '));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
            부족재료 장바구니
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>스마트 장보기 & 쿠팡 딥링크</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          레시피에서 부족한 재료를 모아 쿠팡에서 최저가로 구매하고 냉장고로 자동 동기화합니다.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '50px 20px',
          background: 'var(--card-bg)',
          borderRadius: '24px',
          border: '1px dashed var(--card-border)',
          color: 'var(--text-muted)'
        }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>장바구니가 비어 있습니다.</h3>
          <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
            AI 레시피 탭에서 부족한 식재료를 장바구니에 담아보세요!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Cart Summary Header */}
          <div style={{
            background: 'linear-gradient(135deg, #ff6b35, #ea580c)',
            borderRadius: '20px',
            padding: '18px',
            color: 'white',
            boxShadow: '0 8px 20px rgba(234, 88, 12, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>선택 상품 {selectedItems.length}개 / 총 {cartItems.length}개</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>
                예상 결제액: {totalPrice.toLocaleString()}원
              </div>
            </div>

            <button
              onClick={onClearCart}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              전체 비우기
            </button>
          </div>

          {/* Cart Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cartItems.map(item => (
              <CartRow
                key={item.id}
                item={item}
                onToggle={onToggleItem}
                onRemove={onRemoveItem}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            
            {/* Batch Coupang Link */}
            <a
              href={batchCoupangUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: '#e11d48',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(225, 29, 72, 0.35)'
              }}
            >
              <ExternalLink size={18} /> 쿠팡에서 선택 상품 {selectedItems.length}개 일괄 검색/구매하기
            </a>

            {/* Sync to Fridge Button */}
            <button
              onClick={handlePurchaseAndAddToFridge}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <CheckCircle2 size={20} /> 구매 완료! 선택 재료 내 냉장고로 자동 이동
            </button>

          </div>

        </div>
      )}

    </div>
  );
};

const CartRow: React.FC<{
  item: CartItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ item, onToggle, onRemove }) => {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '16px',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggle(item.id)}
          style={{ width: '20px', height: '20px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
        />

        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
            {item.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({item.quantity})</span>
          </div>

          {item.recipeOrigin && (
            <div style={{ fontSize: '0.72rem', color: 'var(--primary-600)', marginTop: '2px' }}>
              🍳 출처: {item.recipeOrigin}
            </div>
          )}
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            약 {item.estimatedPrice.toLocaleString()}원
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <a
          href={item.coupangUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '6px 10px',
            borderRadius: '10px',
            background: '#e11d48',
            color: 'white',
            fontSize: '0.72rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          쿠팡 <ExternalLink size={12} />
        </a>

        <button
          onClick={() => onRemove(item.id)}
          style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px' }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
