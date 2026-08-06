import React, { useState, useEffect } from 'react';
import { Ingredient, StorageType, Category } from '../types';
import { X, Check } from 'lucide-react';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredient: Ingredient) => void;
  initialData?: Ingredient | null;
}

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('채소/과일');
  const [storage, setStorage] = useState<StorageType>('fridge');
  const [quantity, setQuantity] = useState('1개');
  const [expiryDate, setExpiryDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setStorage(initialData.storage);
      setQuantity(initialData.quantity);
      setExpiryDate(initialData.expiryDate);
      setNote(initialData.note || '');
    } else {
      // Default initial values
      const defaultExp = new Date();
      defaultExp.setDate(defaultExp.getDate() + 7);
      setName('');
      setCategory('채소/과일');
      setStorage('fridge');
      setQuantity('1개');
      setExpiryDate(defaultExp.toISOString().split('T')[0]);
      setNote('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const today = new Date().toISOString().split('T')[0];

    const ingredient: Ingredient = {
      id: initialData ? initialData.id : `ing-manual-${Date.now()}`,
      name: name.trim(),
      category,
      storage,
      quantity: quantity.trim() || '1개',
      expiryDate: expiryDate || today,
      addedDate: initialData ? initialData.addedDate : today,
      note: note.trim() || undefined
    };

    onSave(ingredient);
    onClose();
  };

  const categories: Category[] = ['채소/과일', '육류/계란', '수산물', '유제품/가공식품', '양념/소셜', '기타'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            {initialData ? '식재료 정보 수정' : '새 식재료 직접 추가'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Item Name */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              식재료명 *
            </label>
            <input
              type="text"
              required
              placeholder="예: 대파, 파프리카, 삼겹살"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                background: 'var(--card-bg)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Storage Type */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              보관 위치
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { type: 'fridge', label: '🧊 냉장' },
                { type: 'freezer', label: '❄️ 냉동' },
                { type: 'pantry', label: '📦 실온' }
              ].map(st => (
                <button
                  type="button"
                  key={st.type}
                  onClick={() => setStorage(st.type as StorageType)}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: storage === st.type ? '2px solid var(--primary-500)' : '1px solid var(--card-border)',
                    background: storage === st.type ? 'var(--primary-50)' : 'var(--card-bg)',
                    color: storage === st.type ? 'var(--primary-700)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              카테고리
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    border: category === cat ? '1px solid var(--primary-500)' : '1px solid var(--card-border)',
                    background: category === cat ? 'var(--primary-500)' : 'var(--card-bg)',
                    color: category === cat ? 'white' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Expiry Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                수량
              </label>
              <input
                type="text"
                placeholder="예: 3개, 500g, 1봉"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                유통기한 *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
              보관 팁 / 메모 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 키친타월 감싸서 밀폐용기 보관"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                background: 'var(--card-bg)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            <Check size={18} /> {initialData ? '수정 완료' : '냉장고에 저장하기'}
          </button>
        </form>
      </div>
    </div>
  );
};
