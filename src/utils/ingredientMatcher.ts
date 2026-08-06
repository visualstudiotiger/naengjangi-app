/**
 * 영수증 원문 → 표준 식재료명 정규화 파이프라인 (02_technical_spec.md §7)
 *  1차 사전 매칭: 정규화 후 alias 정확/부분 일치
 *  2차 유사도 매칭: 자소(jamo) 분해 후 편집거리 유사도, 임계값 이상만 채택
 *  confidence(high/medium/low) 부여 → UI 태그 색상에 매핑
 */
import { INGREDIENT_DICTIONARY, type DictCategory } from '../data/ingredientDictionary'

export type MatchConfidence = 'high' | 'medium' | 'low'

export interface MatchResult {
  rawText: string
  standardName: string | null
  category: DictCategory | null
  defaultExpiryDays: number | null
  confidence: MatchConfidence
  /** 0~1, 2차 유사도 점수 (참고용) */
  score: number
}

/** 브랜드/수량/단위/특수문자 제거 후 한글·영숫자만 남김 */
export function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '') // 괄호 내용 제거
    .replace(/\d+(\.\d+)?\s*(g|kg|ml|l|개|봉|팩|입|매|장|ea|구|미|모|병|캔|포|줄|kg|g)?/g, '') // 수량+단위
    .replace(/[^가-힣a-z0-9]/g, '') // 한글/영문/숫자 외 제거
    .trim()
}

/* ---------- 한글 자소 분해 ---------- */
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

function toJamo(s: string): string {
  let out = ''
  for (const ch of s) {
    const code = ch.charCodeAt(0)
    if (code >= 0xac00 && code <= 0xd7a3) {
      const i = code - 0xac00
      out += CHO[Math.floor(i / 588)] + JUNG[Math.floor((i % 588) / 28)] + JONG[i % 28]
    } else {
      out += ch
    }
  }
  return out
}

/* ---------- 편집거리 유사도 ---------- */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array(n + 1)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

function similarity(a: string, b: string): number {
  const ja = toJamo(a)
  const jb = toJamo(b)
  const maxLen = Math.max(ja.length, jb.length)
  if (!maxLen) return 0
  return 1 - levenshtein(ja, jb) / maxLen
}

/* ---------- 정규화된 alias 인덱스 (모듈 로드 시 1회 구성) ---------- */
type AliasEntry = { norm: string; entryIndex: number }
const ALIAS_INDEX: AliasEntry[] = []
INGREDIENT_DICTIONARY.forEach((entry, entryIndex) => {
  for (const alias of entry.aliases) {
    const norm = normalizeText(alias)
    if (norm) ALIAS_INDEX.push({ norm, entryIndex })
  }
})

const SIM_ACCEPT = 0.6 // 2차 유사도 최소 채택 임계값
const SIM_HIGH = 0.8

/** 원문 한 줄을 표준 식재료로 매칭 */
export function matchIngredient(rawText: string): MatchResult {
  const norm = normalizeText(rawText)
  const base = (idx: number) => INGREDIENT_DICTIONARY[idx]
  const none: MatchResult = {
    rawText,
    standardName: null,
    category: null,
    defaultExpiryDays: null,
    confidence: 'low',
    score: 0,
  }
  if (!norm) return none

  // 1차: 정확 일치
  const exact = ALIAS_INDEX.find((a) => a.norm === norm)
  if (exact) {
    const e = base(exact.entryIndex)
    return { rawText, standardName: e.standardName, category: e.category, defaultExpiryDays: e.defaultExpiryDays, confidence: 'high', score: 1 }
  }

  // 1차: 부분 일치 (alias가 원문에 포함 — 예: "하림닭가슴살" ⊇ "닭가슴살"). 2글자 이상만.
  const contained = ALIAS_INDEX.filter((a) => a.norm.length >= 2 && norm.includes(a.norm)).sort(
    (x, y) => y.norm.length - x.norm.length,
  )[0]
  if (contained) {
    const e = base(contained.entryIndex)
    return { rawText, standardName: e.standardName, category: e.category, defaultExpiryDays: e.defaultExpiryDays, confidence: 'high', score: 0.95 }
  }

  // 2차: 자소 유사도
  let best: AliasEntry | null = null
  let bestScore = 0
  for (const a of ALIAS_INDEX) {
    const s = similarity(norm, a.norm)
    if (s > bestScore) {
      bestScore = s
      best = a
    }
  }
  if (best && bestScore >= SIM_ACCEPT) {
    const e = base(best.entryIndex)
    return {
      rawText,
      standardName: e.standardName,
      category: e.category,
      defaultExpiryDays: e.defaultExpiryDays,
      confidence: bestScore >= SIM_HIGH ? 'medium' : 'low',
      score: Number(bestScore.toFixed(2)),
    }
  }

  return none
}
