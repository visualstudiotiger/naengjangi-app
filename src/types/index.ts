export type StorageType = 'fridge' | 'freezer' | 'pantry';

export type Category = 
  | '채소/과일'
  | '육류/계란'
  | '수산물'
  | '유제품/가공식품'
  | '양념/소셜'
  | '기타';

export interface Ingredient {
  id: string;
  name: string;
  category: Category;
  storage: StorageType;
  quantity: string;
  expiryDate: string; // YYYY-MM-DD
  addedDate: string;  // YYYY-MM-DD
  note?: string;
}

export interface OCRScannedItem {
  id: string;
  name: string;          // 매칭된 표준명 (없으면 원문)
  rawText: string;       // 영수증 원문 라인
  matchConfidence: 'high' | 'medium' | 'low';
  category: Category;
  storage: StorageType;
  quantity: string;
  suggestedExpiryDays: number;
  selected: boolean;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  inStock: boolean;
  matchedIngredientId?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  cookingTime: number; // minutes
  difficulty: '쉬움' | '보통' | '어려움';
  imageUrl: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  matchRate?: number; // 0 to 100
}

export interface CartItem {
  id: string;
  name: string;
  quantity: string;
  category: Category;
  recipeOrigin?: string;
  coupangUrl: string;
  estimatedPrice: number;
  checked: boolean;
}
