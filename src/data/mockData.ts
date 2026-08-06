import { Ingredient, Recipe } from '../types';

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: '대파',
    category: '채소/과일',
    storage: 'fridge',
    quantity: '1단',
    expiryDate: addDays(2), // D-2 (임박!)
    addedDate: addDays(-5),
    note: '뿌리 부분 키친타월 감쌈'
  },
  {
    id: 'ing-2',
    name: '계란',
    category: '육류/계란',
    storage: 'fridge',
    quantity: '10구',
    expiryDate: addDays(12),
    addedDate: addDays(-2)
  },
  {
    id: 'ing-3',
    name: '돼지고기 목살',
    category: '육류/계란',
    storage: 'fridge',
    quantity: '400g',
    expiryDate: addDays(1), // D-1 (오늘/내일 소비 필요!)
    addedDate: addDays(-3),
    note: '오늘 제육볶음 추천'
  },
  {
    id: 'ing-4',
    name: '두부',
    category: '유제품/가공식품',
    storage: 'fridge',
    quantity: '1모',
    expiryDate: addDays(4),
    addedDate: addDays(-1)
  },
  {
    id: 'ing-5',
    name: '양파',
    category: '채소/과일',
    storage: 'pantry',
    quantity: '3개',
    expiryDate: addDays(15),
    addedDate: addDays(-4)
  },
  {
    id: 'ing-6',
    name: '김치',
    category: '유제품/가공식품',
    storage: 'fridge',
    quantity: '1kg',
    expiryDate: addDays(30),
    addedDate: addDays(-10)
  },
  {
    id: 'ing-7',
    name: '우유',
    category: '유제품/가공식품',
    storage: 'fridge',
    quantity: '500ml',
    expiryDate: addDays(-1), // 만료됨!
    addedDate: addDays(-7)
  },
  {
    id: 'ing-8',
    name: '냉동 새우',
    category: '수산물',
    storage: 'freezer',
    quantity: '300g',
    expiryDate: addDays(60),
    addedDate: addDays(-15)
  },
  {
    id: 'ing-9',
    name: '마늘',
    category: '채소/과일',
    storage: 'fridge',
    quantity: '15알',
    expiryDate: addDays(7),
    addedDate: addDays(-3)
  },
  {
    id: 'ing-10',
    name: '팽이버섯',
    category: '채소/과일',
    storage: 'fridge',
    quantity: '2봉',
    expiryDate: addDays(3),
    addedDate: addDays(-2)
  }
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: '돼지고기 김치찌개',
    description: '잘 익은 김치와 쫄깃한 돼지고기로 끓이는 깊은 맛의 김치찌개',
    category: '한식/국물',
    cookingTime: 25,
    difficulty: '쉬움',
    imageUrl: 'https://images.unsplash.com/photo-1583032015879-e5022cb87c3b?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: '돼지고기 목살', quantity: '300g', inStock: true, matchedIngredientId: 'ing-3' },
      { name: '김치', quantity: '200g', inStock: true, matchedIngredientId: 'ing-6' },
      { name: '두부', quantity: '1/2모', inStock: true, matchedIngredientId: 'ing-4' },
      { name: '대파', quantity: '1/2대', inStock: true, matchedIngredientId: 'ing-1' },
      { name: '양파', quantity: '1/2개', inStock: true, matchedIngredientId: 'ing-5' },
      { name: '고춧가루', quantity: '1큰술', inStock: false },
      { name: '국간장', quantity: '1큰술', inStock: false }
    ],
    steps: [
      '냄비에 썰어둔 돼지고기와 김치를 넣고 달달 볶아줍니다.',
      '고기가 살짝 익으면 쌀뜨물 또는 물 500ml를 넣고 강불로 끓여줍니다.',
      '양파와 깍둑썰기 한 두부를 넣고 약불로 줄여 10분간 뭉근히 조립니다.',
      '어슷 썬 대파와 고춧가루, 국간장으로 간을 맞춰 한소끔 더 끓여 완성합니다.'
    ]
  },
  {
    id: 'rec-2',
    title: '백종원표 파기름 계란볶음밥',
    description: '대파 풍미가 가득한 간단하지만 완벽한 초스피드 볶음밥',
    category: '한식/일품',
    cookingTime: 15,
    difficulty: '쉬움',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: '계란', quantity: '2개', inStock: true, matchedIngredientId: 'ing-2' },
      { name: '대파', quantity: '1대', inStock: true, matchedIngredientId: 'ing-1' },
      { name: '밥', quantity: '1공기', inStock: false },
      { name: '굴소스', quantity: '1큰술', inStock: false },
      { name: '식용유', quantity: '2큰술', inStock: false }
    ],
    steps: [
      '팬에 식용유를 두르고 송송 썬 대파를 볶아 파기름을 만듭니다.',
      '파를 한쪽에 밀어두고 계란을 풀어 스크램블을 만듭니다.',
      '진간장을 냄비 가장자리에 살짝 눌러 불향을 입힌 뒤 밥을 넣습니다.',
      '센 불에서 고슬고슬하게 볶아 그릇에 담아냅니다.'
    ]
  },
  {
    id: 'rec-3',
    title: '감바스 알 아히요',
    description: '마늘과 올리브유, 새우의 조화로 느끼함 없이 감칠맛 폭발하는 요리',
    category: '양식',
    cookingTime: 20,
    difficulty: '보통',
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: '냉동 새우', quantity: '200g', inStock: true, matchedIngredientId: 'ing-8' },
      { name: '마늘', quantity: '10알', inStock: true, matchedIngredientId: 'ing-9' },
      { name: '올리브유', quantity: '100ml', inStock: false },
      { name: '페페론치노', quantity: '5개', inStock: false },
      { name: '바게트 빵', quantity: '1/2개', inStock: false }
    ],
    steps: [
      '새우는 해동 후 물기를 제거하고 소금, 후추로 밑간합니다.',
      '팬에 올리브유를 넉넉히 두르고 편으로 썬 마늘과 페페론치노를 약불에서 튀기듯 볶습니다.',
      '마늘 향이 올라오면 새우를 넣고 3~4분간 익혀줍니다.',
      '구운 바게트 빵을 곁들여 올리브유와 함께 즐깁니다.'
    ]
  },
  {
    id: 'rec-4',
    title: '팽이버섯 두부 부침',
    description: '칼로리는 낮고 고소함은 배가 되는 영양 가득 반찬',
    category: '한식/반찬',
    cookingTime: 12,
    difficulty: '쉬움',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      { name: '두부', quantity: '1모', inStock: true, matchedIngredientId: 'ing-4' },
      { name: '팽이버섯', quantity: '1봉', inStock: true, matchedIngredientId: 'ing-10' },
      { name: '계란', quantity: '2개', inStock: true, matchedIngredientId: 'ing-2' },
      { name: '대파', quantity: '1/4대', inStock: true, matchedIngredientId: 'ing-1' },
      { name: '소금', quantity: '약간', inStock: false }
    ],
    steps: [
      '두부는 먹기 좋은 크기로 썰고 팽이버섯은 3등분합니다.',
      '계란물에 다진 대파와 팽이버섯, 소금을 약간 넣어 섞어줍니다.',
      '두부에 계란 옷을 입혀 노릇하게 구워냅니다.'
    ]
  }
];

export const SAMPLE_OCR_RECEIPTS = [
  {
    title: '이마트 성수점 영수증',
    date: '2026-07-29',
    items: [
      { name: '신선 삼겹살', category: '육류/계란', storage: 'fridge', quantity: '600g', expiryDays: 4 },
      { name: '청양고추', category: '채소/과일', storage: 'fridge', quantity: '1봉', expiryDays: 10 },
      { name: '무농약 콩나물', category: '채소/과일', storage: 'fridge', quantity: '300g', expiryDays: 5 },
      { name: '서울우유 1L', category: '유제품/가공식품', storage: 'fridge', quantity: '1개', expiryDays: 9 },
      { name: '크래미 크랩', category: '유제품/가공식품', storage: 'fridge', quantity: '200g', expiryDays: 14 }
    ]
  },
  {
    title: '쿠팡 로켓프레시 영수증',
    date: '2026-07-30',
    items: [
      { name: '친환경 파프리카 3색', category: '채소/과일', storage: 'fridge', quantity: '1팩', expiryDays: 8 },
      { name: '닭가슴살 훈제', category: '육류/계란', storage: 'freezer', quantity: '1kg', expiryDays: 90 },
      { name: '아보카도', category: '채소/과일', storage: 'pantry', quantity: '4개', expiryDays: 6 },
      { name: '그릭요거트', category: '유제품/가공식품', storage: 'fridge', quantity: '450g', expiryDays: 12 }
    ]
  }
];
