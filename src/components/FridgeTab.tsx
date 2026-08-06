import React, { useState } from 'react';
import { Ingredient, StorageType, Category } from '../types';
import { getDDayInfo } from '../utils/dateUtils';
import { Search, Plus, Trash2, Edit3, Package } from 'lucide-react';

interface FridgeTabProps {
  ingredients: Ingredient[];
  onAddIngredient: () => void;
  onEditIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
}

export const FridgeTab: React.FC<FridgeTabProps> = ({
  ingredients,
  onAddIngredient,
  onEditIngredient,
  onDeleteIngredient
}) => {
  const [activeStorage, setActiveStorage] = useState<'all' | StorageType>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dday' | 'name' | 'added'>('dday');

  const categories: Category[] = ['채소/과일', '육류/계란', '수산물', '유제품/가공식품', '양념/소셜', '기타'];

  // Filtering
  const filtered = ingredients.filter(item => {
    const matchesStorage = activeStorage === 'all' || item.storage === activeStorage;
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStorage && matchesCategory && matchesSearch;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'dday') {
      const ddayA = getDDayInfo(a.expiryDate).days;
      const ddayB = getDDayInfo(b.expiryDate).days;
      return ddayA - ddayB;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'ko');
    } else {
      return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    }
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>내 냉장고 식재료</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              총 <strong style={{ color: 'var(--primary-600)' }}>{ingredients.length}개</strong>의 재료가 보관되어 있습니다.
            </p>
          </div>
          <button
            onClick={onAddIngredient}
            style={{
              padding: '8px 14px',
              borderRadius: '14px',
              background: 'var(--primary-500)',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Plus size={16} /> 추가
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="식재료 검색 (예: 대파, 계란, 두부)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              borderRadius: '16px',
              border: '1px solid var(--card-border)',
              background: 'var(--card-bg)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Storage Type Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '16px' }}>
        <button
          onClick={() => setActiveStorage('all')}
          style={{
            padding: '8px 0',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            background: activeStorage === 'all' ? 'var(--card-bg)' : 'transparent',
            color: activeStorage === 'all' ? 'var(--primary-600)' : 'var(--text-muted)',
            boxShadow: activeStorage === 'all' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          전체 ({ingredients.length})
        </button>
        <button
          onClick={() => setActiveStorage('fridge')}
          style={{
            padding: '8px 0',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            background: activeStorage === 'fridge' ? 'var(--card-bg)' : 'transparent',
            color: activeStorage === 'fridge' ? 'var(--primary-600)' : 'var(--text-muted)',
            boxShadow: activeStorage === 'fridge' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          🧊 냉장
        </button>
        <button
          onClick={() => setActiveStorage('freezer')}
          style={{
            padding: '8px 0',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            background: activeStorage === 'freezer' ? 'var(--card-bg)' : 'transparent',
            color: activeStorage === 'freezer' ? 'var(--primary-600)' : 'var(--text-muted)',
            boxShadow: activeStorage === 'freezer' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          ❄️ 냉동
        </button>
        <button
          onClick={() => setActiveStorage('pantry')}
          style={{
            padding: '8px 0',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            background: activeStorage === 'pantry' ? 'var(--card-bg)' : 'transparent',
            color: activeStorage === 'pantry' ? 'var(--primary-600)' : 'var(--text-muted)',
            boxShadow: activeStorage === 'pantry' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          📦 실온
        </button>
      </div>

      {/* Category Scroll Bar & Sort */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: activeCategory === 'all' ? '1px solid var(--primary-500)' : '1px solid var(--card-border)',
              background: activeCategory === 'all' ? 'var(--primary-50)' : 'var(--card-bg)',
              color: activeCategory === 'all' ? 'var(--primary-700)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            카테고리 전체
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: activeCategory === cat ? '1px solid var(--primary-500)' : '1px solid var(--card-border)',
                background: activeCategory === cat ? 'var(--primary-50)' : 'var(--card-bg)',
                color: activeCategory === cat ? 'var(--primary-700)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: '6px 10px',
            borderRadius: '12px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            fontSize: '0.75rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="dday">⏳ 유통기한 순</option>
          <option value="name">🔤 이름 순</option>
          <option value="added">📅 등록 최신순</option>
        </select>
      </div>

      {/* Ingredients List Grid */}
      {sorted.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--card-bg)',
          borderRadius: '20px',
          border: '1px dashed var(--card-border)',
          color: 'var(--text-muted)'
        }}>
          <Package size={40} style={{ opacity: 0.4, marginBottom: '8px' }} />
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>해당 조건의 식재료가 없습니다.</p>
          <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>새로운 식재료를 등록하거나 영수증 OCR을 스캔해 보세요!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sorted.map(item => (
            <IngredientRow
              key={item.id}
              item={item}
              onEdit={onEditIngredient}
              onDelete={onDeleteIngredient}
            />
          ))}
        </div>
      )}

    </div>
  );
};

const IngredientRow: React.FC<{
  item: Ingredient;
  onEdit: (item: Ingredient) => void;
  onDelete: (id: string) => void;
}> = ({ item, onEdit, onDelete }) => {
  const dday = getDDayInfo(item.expiryDate);

  const getEmoji = (category: string) => {
    switch (category) {
      case '채소/과일': return '🥬';
      case '육류/계란': return '🥩';
      case '수산물': return '🦐';
      case '유제품/가공식품': return '🥛';
      default: return '🥫';
    }
  };

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
        boxShadow: 'var(--shadow-sm)',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: item.storage === 'fridge' ? '#e0f2fe' : item.storage === 'freezer' ? '#dbeafe' : '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem'
        }}>
          {getEmoji(item.category)}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</span>
            <span style={{
              fontSize: '0.7rem',
              background: 'rgba(0,0,0,0.05)',
              padding: '2px 6px',
              borderRadius: '6px',
              color: 'var(--text-muted)'
            }}>
              {item.quantity}
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px' }}>
            <span>보관: {item.storage === 'fridge' ? '냉장' : item.storage === 'freezer' ? '냉동' : '실온'}</span>
            <span>·</span>
            <span>유통기한: {item.expiryDate}</span>
          </div>

          {item.note && (
            <div style={{ fontSize: '0.72rem', color: 'var(--primary-600)', marginTop: '2px' }}>
              💡 {item.note}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <span className={`badge-dday ${dday.type}`}>
          {dday.badgeText}
        </span>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onEdit(item)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            title="수정"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px' }}
            title="삭제"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
