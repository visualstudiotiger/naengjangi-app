/**
 * OCR 원문 라인 → 검토용 스캔 아이템(OCRScannedItem) 변환.
 * matchIngredient(사전/유사도) 결과에 앱 카테고리 매핑·보관위치 추론·수량 추출을 얹는다.
 */
import type { Category, OCRScannedItem, StorageType } from '../types'
import { matchIngredient } from './ingredientMatcher'
import type { DictCategory } from '../data/ingredientDictionary'

const CATEGORY_MAP: Record<DictCategory, Category> = {
  채소: '채소/과일',
  과일: '채소/과일',
  육류: '육류/계란',
  계란: '육류/계란',
  '두부/콩류': '유제품/가공식품',
  수산물: '수산물',
  유제품: '유제품/가공식품',
  '곡물/면': '유제품/가공식품',
  '가공식품/냉동': '유제품/가공식품',
  '조미료/소스': '양념/소셜',
  '김치/절임': '기타',
  음료: '기타',
}

const STORAGE_MAP: Record<DictCategory, StorageType> = {
  채소: 'fridge',
  과일: 'fridge',
  육류: 'fridge',
  계란: 'fridge',
  '두부/콩류': 'fridge',
  수산물: 'fridge',
  유제품: 'fridge',
  '가공식품/냉동': 'freezer',
  '곡물/면': 'pantry',
  '조미료/소스': 'pantry',
  '김치/절임': 'fridge',
  음료: 'pantry',
}

/** 원문에서 수량 토큰 추출 (예: "600g", "1L", "15구", "1단", "1팩") */
export function extractQuantity(raw: string): string {
  const m = raw.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l|개|봉|팩|입|구|단|매|장|모|병|캔|포|줄|ea)/i)
  if (m) return `${m[1]}${m[2].toLowerCase()}`
  return '1개'
}

export function scanReceiptLines(lines: string[]): OCRScannedItem[] {
  return lines.map((line, idx) => {
    const m = matchIngredient(line)
    const cat = m.category
    return {
      id: `ocr-${idx}-${line.length}-${cat ?? 'x'}`,
      name: m.standardName ?? line.trim(),
      rawText: line.trim(),
      matchConfidence: m.confidence,
      category: cat ? CATEGORY_MAP[cat] : '기타',
      storage: cat ? STORAGE_MAP[cat] : 'fridge',
      quantity: extractQuantity(line),
      suggestedExpiryDays: m.defaultExpiryDays ?? 7,
      selected: m.standardName != null, // 매칭 실패 항목은 기본 미선택 → 사용자가 확인 후 선택
    }
  })
}
