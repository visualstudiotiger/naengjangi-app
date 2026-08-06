import { Ingredient, Recipe } from '../types';
import { matchIngredient } from './ingredientMatcher';
import { getDDayInfo } from './dateUtils';

/** 이름을 표준 식재료명으로 정규화 */
const toStandardName = (name: string) => matchIngredient(name).standardName ?? name.trim();

export interface ProcessedRecipe extends Recipe {
  matchRate: number;
  urgentMatchCount: number;
  score: number; // 매칭률 + 임박 재료 가중치
}

/**
 * 보유 식재료와 레시피를 비교하여 매칭률 및 유통기한 임박 식재료 가중치 기반 종합 점수 산출
 */
export function calculateRecipeScores(
  recipes: Recipe[],
  ingredients: Ingredient[]
): ProcessedRecipe[] {
  // 냉장고 재료 표준화 및 D-Day 정보 생성
  const fridgeItems = ingredients.map((i) => {
    const std = toStandardName(i.name);
    const dDay = getDDayInfo(i.expiryDate);
    // D-Day가 2일 이내(임박/만료)인 경우 임박 재료로 분류
    const isUrgent = dDay.days <= 2;
    return { ...i, std, dDay: dDay.days, isUrgent };
  });

  return recipes
    .map((recipe) => {
      let urgentMatchCount = 0;

      const ingredientStatus = recipe.ingredients.map((ing) => {
        const rStd = toStandardName(ing.name);
        const matchInFridge = fridgeItems.find(
          (f) =>
            f.std === rStd ||
            f.name.includes(ing.name) ||
            ing.name.includes(f.name)
        );

        if (matchInFridge && matchInFridge.isUrgent) {
          urgentMatchCount++;
        }

        return {
          ...ing,
          inStock: !!matchInFridge,
          matchedIngredientId: matchInFridge?.id,
        };
      });

      const inStockCount = ingredientStatus.filter((i) => i.inStock).length;
      const matchRate = Math.round(
        (inStockCount / (ingredientStatus.length || 1)) * 100
      );

      // 기본 점수: 매칭률(0~100) + 임박 재료 매칭당 15점 가중치
      const score = matchRate + urgentMatchCount * 15;

      return {
        ...recipe,
        ingredients: ingredientStatus,
        matchRate,
        urgentMatchCount,
        score,
      };
    })
    .sort((a, b) => b.score - a.score || b.matchRate - a.matchRate);
}

/**
 * AI custom recipe generator fallback
 * 사용자가 입력한 식재료 키워드를 기반으로 맞춤형 AI 레시피 생성
 */
export function generateAiCustomRecipe(
  promptIngredients: string,
  userFridgeIngredients: Ingredient[]
): Recipe {
  const inputList = promptIngredients
    .split(/[,/ ]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const mainItem = inputList[0] || '냉장고 남아있는 재료';
  const subItem = inputList[1] || '기타 양념';

  // 보유 재료와 비교하여 inStock 매칭
  const ingredientsList = [
    { name: mainItem, quantity: '적당량' },
    { name: subItem, quantity: '약간' },
    { name: '대파', quantity: '1/2대' },
    { name: '마늘', quantity: '3알' },
    { name: '간장', quantity: '1큰술' },
    { name: '참기름', quantity: '1작은술' }
  ].map(ing => {
    const matched = userFridgeIngredients.find(f => f.name.includes(ing.name) || ing.name.includes(f.name));
    return {
      name: ing.name,
      quantity: ing.quantity,
      inStock: !!matched,
      matchedIngredientId: matched?.id
    };
  });

  return {
    id: `ai-gen-${Date.now()}`,
    title: `AI 셰프추천: ${mainItem} ${subItem} 특제 요리`,
    description: `보유하신 ${inputList.join(', ')} 식재료를 최대한 활용해 만드는 손쉬운 셰프 레시피입니다.`,
    category: 'AI 셰프 특선',
    cookingTime: 15,
    difficulty: '쉬움',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: ingredientsList,
    steps: [
      `${mainItem}와(과) 기본 식재료를 한입 크기로 보기 좋게 손질해 줍니다.`,
      '달군 팬에 식용유를 두르고 다진 마늘과 대파를 볶아 풍미를 끌어올립니다.',
      `손질해 둔 ${mainItem}을(를) 센 불에 넣어 노릇하게 볶아줍니다.`,
      '간장과 참기름으로 짭조름하게 간을 맞춘 뒤 그릇에 담아 완성합니다.'
    ],
    matchRate: 100
  };
}
