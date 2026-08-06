import React, { useState } from 'react';
import { Recipe, Ingredient, CartItem, Category } from '../types';
import { Clock, Flame, ShoppingCart, ChevronRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecipeTabProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAddToCart: (items: CartItem[]) => void;
  onNavigateToCart: () => void;
  selectedRecipeModal?: Recipe | null;
  onCloseRecipeModal?: () => void;
}

export const RecipeTab: React.FC<RecipeTabProps> = ({
  recipes,
  ingredients,
  onAddToCart,
  onNavigateToCart,
  selectedRecipeModal,
  onCloseRecipeModal
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [detailModalRecipe, setDetailModalRecipe] = useState<Recipe | null>(selectedRecipeModal || null);

  React.useEffect(() => {
    if (selectedRecipeModal !== undefined) {
      setDetailModalRecipe(selectedRecipeModal);
    }
  }, [selectedRecipeModal]);

  const processedRecipes = recipes.map(recipe => {
    const ingredientStatus = recipe.ingredients.map(ing => {
      const matchInFridge = ingredients.find(inFridge => 
        inFridge.name.includes(ing.name) || ing.name.includes(inFridge.name)
      );
      return {
        ...ing,
        inStock: !!matchInFridge,
        matchedIngredientId: matchInFridge?.id
      };
    });

    const inStockCount = ingredientStatus.filter(i => i.inStock).length;
    const matchRate = Math.round((inStockCount / ingredientStatus.length) * 100);

    return {
      ...recipe,
      ingredients: ingredientStatus,
      matchRate
    };
  }).sort((a, b) => b.matchRate - a.matchRate);

  const categories = ['all', '한식/국물', '한식/일품', '양식', '한식/반찬'];

  const filteredRecipes = processedRecipes.filter(r => 
    activeCategory === 'all' || r.category === activeCategory
  );

  const handleAddMissingToCart = (recipe: Recipe) => {
    const missing = recipe.ingredients.filter(ing => !ing.inStock);

    const cartItems: CartItem[] = missing.map((ing, idx) => ({
      id: `cart-${Date.now()}-${idx}`,
      name: ing.name,
      quantity: ing.quantity,
      category: '기타' as Category,
      recipeOrigin: recipe.title,
      coupangUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(ing.name)}`,
      estimatedPrice: 3500 + (idx * 1200),
      checked: true
    }));

    onAddToCart(cartItems);

    try {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
    } catch (e) {}

    onNavigateToCart();
  };

  const closeModal = () => {
    setDetailModalRecipe(null);
    if (onCloseRecipeModal) onCloseRecipeModal();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
            AI 레시피 추천
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>냉장고 파먹기 AI 매칭</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          현재 남은 식재료를 바탕으로 가장 높은 매칭률의 요리를 AI가 찾아드립니다.
        </p>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: activeCategory === cat ? '1px solid var(--primary-500)' : '1px solid var(--card-border)',
              background: activeCategory === cat ? 'var(--primary-500)' : 'var(--card-bg)',
              color: activeCategory === cat ? 'white' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: activeCategory === cat ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            {cat === 'all' ? '전체 보기' : cat}
          </button>
        ))}
      </div>

      {/* Recipe Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onOpenDetail={setDetailModalRecipe}
            onAddMissing={handleAddMissingToCart}
          />
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {detailModalRecipe && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '3px 8px', borderRadius: '8px' }}>
                {detailModalRecipe.category}
              </span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            <img
              src={detailModalRecipe.imageUrl}
              alt={detailModalRecipe.title}
              style={{ width: '100%', height: '180px', borderRadius: '16px', objectFit: 'cover', marginBottom: '14px' }}
            />

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>{detailModalRecipe.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
              {detailModalRecipe.description}
            </p>

            {/* Ingredients Check List */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>필요 식재료 목록</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {detailModalRecipe.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: ing.inStock ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: ing.inStock ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ing.inStock ? '#059669' : '#dc2626' }}>
                      {ing.name} ({ing.quantity})
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: ing.inStock ? '#059669' : '#dc2626' }}>
                      {ing.inStock ? '보유중' : '부족'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step by step Cooking */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>단계별 조리법</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {detailModalRecipe.steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--primary-500)',
                      color: 'white',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4, marginTop: '2px' }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Ingredients Button in Modal */}
            {detailModalRecipe.ingredients.some(i => !i.inStock) && (
              <button
                onClick={() => {
                  handleAddMissingToCart(detailModalRecipe);
                  closeModal();
                }}
                className="btn-primary"
              >
                <ShoppingCart size={18} /> 부족한 재료 장바구니에 담고 쿠팡 구매
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const RecipeCard: React.FC<{
  recipe: Recipe & { matchRate: number };
  onOpenDetail: (recipe: Recipe) => void;
  onAddMissing: (recipe: Recipe) => void;
}> = ({ recipe, onOpenDetail, onAddMissing }) => {
  const missingCount = recipe.ingredients.filter(i => !i.inStock).length;

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        borderRadius: '20px',
        border: '1px solid var(--card-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', padding: '12px', gap: '12px' }}>
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          style={{ width: '100px', height: '100px', borderRadius: '14px', objectFit: 'cover' }}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{recipe.title}</h3>
              <span style={{
                background: recipe.matchRate >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: recipe.matchRate >= 80 ? '#059669' : '#d97706',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '12px'
              }}>
                {recipe.matchRate}% 매칭
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={12} /> {recipe.cookingTime}분
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Flame size={12} /> 난이도 {recipe.difficulty}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            보유 재료: <strong style={{ color: '#059669' }}>{recipe.ingredients.filter(i => i.inStock).length}개</strong> · 부족 재료: <strong style={{ color: '#dc2626' }}>{missingCount}개</strong>
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.02)',
        padding: '10px 14px',
        borderTop: '1px solid var(--card-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => onOpenDetail(recipe)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-600)',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          조리 방법 보기 <ChevronRight size={14} />
        </button>

        {missingCount > 0 && (
          <button
            onClick={() => onAddMissing(recipe)}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626',
              padding: '5px 10px',
              borderRadius: '10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ShoppingCart size={13} /> 부족재료 {missingCount}개 담기
          </button>
        )}
      </div>
    </div>
  );
};
