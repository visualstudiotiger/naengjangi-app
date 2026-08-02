import { useEffect, useRef, useState } from "react";
import {
  IconCamera,
  IconX,
  IconLoader2,
  IconCircleCheckFilled,
  IconTrash,
  IconReceipt,
} from "@tabler/icons-react";
import { Button } from "../../components/Button/Button";
import { Badge, type BadgeTone } from "../../components/Badge/Badge";
import styles from "./ReceiptFlow.module.css";

/**
 * 영수증 업로드 플로우 (오버레이).
 * 기술 스펙(02_technical_spec.md §5 POST /receipts → GET /receipts/{id}, §7 정규화 파이프라인) 흐름을 UI로 재현한다.
 * 단계: select(사진 선택) → processing(OCR) → review(신뢰도 태그 검토·수정) → done(냉장고 담기 + 콩알 획득).
 * 백엔드 연동 전까지 OCR 결과는 목업이며, 실제 이미지는 전송하지 않는다.
 */

const EARN_BEANS = 20; // 영수증 등록 보상(currency_transactions: earn_receipt)

type Step = "select" | "processing" | "review" | "done";

type Confidence = "high" | "medium" | "low";

interface ReceiptItem {
  id: number;
  rawText: string;
  name: string;
  confidence: Confidence;
}

/** 영수증 원문 → 표준 식재료명 매칭 결과(목업). confidence는 신뢰도 태그 색상과 매핑된다. */
const MOCK_OCR: ReceiptItem[] = [
  { id: 1, rawText: "하림 닭가슴살 500G", name: "닭가슴살", confidence: "high" },
  { id: 2, rawText: "무항생제 대란 15구", name: "계란", confidence: "high" },
  { id: 3, rawText: "국산 애호박 1개", name: "애호박", confidence: "medium" },
  { id: 4, rawText: "해찬들 고추장 500G", name: "고추장", confidence: "medium" },
  { id: 5, rawText: "풀무원 순두부", name: "순두부", confidence: "medium" },
  { id: 6, rawText: "990233 상품", name: "", confidence: "low" },
];

const CONFIDENCE_META: Record<Confidence, { tone: BadgeTone; label: string }> = {
  high: { tone: "positive", label: "정확" },
  medium: { tone: "neutral", label: "확인" },
  low: { tone: "warning", label: "직접 입력" },
};

interface ReceiptFlowProps {
  onClose: () => void;
  onComplete: (addedCount: number, earnedBeans: number) => void;
}

export function ReceiptFlow({ onClose, onComplete }: ReceiptFlowProps) {
  const [step, setStep] = useState<Step>("select");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // processing 단계 진입 시 OCR 처리를 시뮬레이션한다.
  useEffect(() => {
    if (step !== "processing") return;
    const timer = setTimeout(() => {
      setItems(MOCK_OCR);
      setStep("review");
    }, 1400);
    return () => clearTimeout(timer);
  }, [step]);

  const renameItem = (id: number, name: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, name } : it)));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const hasEmptyName = items.some((it) => it.name.trim() === "");

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="영수증 업로드">
      <div className={styles.sheet}>
        <header className={styles.head}>
          <span className={styles.headTitle}>영수증 업로드</span>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="닫기"
            onClick={onClose}
          >
            <IconX size={22} stroke={1.75} />
          </button>
        </header>

        <div className={styles.content}>
          {step === "select" && (
            <div className={styles.selectStep}>
              <div className={styles.dropZone}>
                <IconReceipt size={44} stroke={1.5} className={styles.dropIcon} />
                <p className={styles.dropText}>
                  영수증을 촬영하거나
                  <br />
                  사진을 선택하세요
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className={styles.fileInput}
                onChange={() => setStep("processing")}
              />
              <Button
                variant="primary"
                fullWidth
                icon={<IconCamera size={20} stroke={1.75} />}
                onClick={() => fileInputRef.current?.click()}
              >
                사진 선택 / 촬영
              </Button>
              <button
                type="button"
                className={styles.demoLink}
                onClick={() => setStep("processing")}
              >
                예시 영수증으로 체험하기
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className={styles.processing}>
              <IconLoader2 size={40} stroke={1.75} className={styles.spinner} />
              <p>영수증을 읽고 있어요…</p>
              <span className={styles.processingSub}>재료를 인식하는 중입니다</span>
            </div>
          )}

          {step === "review" && (
            <div className={styles.review}>
              <p className={styles.reviewCaption}>
                인식된 재료 <b>{items.length}</b>개 · 확인 후 담아주세요
              </p>
              <div className={styles.itemList}>
                {items.map((item) => {
                  const meta = CONFIDENCE_META[item.confidence];
                  const empty = item.name.trim() === "";
                  return (
                    <div key={item.id} className={styles.itemRow}>
                      <div className={styles.itemTop}>
                        <span className={styles.rawText}>영수증 원문: {item.rawText}</span>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          aria-label={`${item.rawText} 삭제`}
                          onClick={() => removeItem(item.id)}
                        >
                          <IconTrash size={16} stroke={1.75} />
                        </button>
                      </div>
                      <div className={styles.itemBottom}>
                        <input
                          className={`${styles.nameInput} ${empty ? styles.nameInputEmpty : ""}`}
                          value={item.name}
                          placeholder="재료명을 입력하세요"
                          aria-label={`${item.rawText}의 재료명`}
                          onChange={(e) => renameItem(item.id, e.target.value)}
                        />
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              {hasEmptyName && (
                <p className={styles.warnHint}>이름이 비어 있는 재료를 입력하거나 삭제해주세요.</p>
              )}
              <div className={styles.footer}>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={items.length === 0 || hasEmptyName}
                  onClick={() => setStep("done")}
                >
                  냉장고에 담기 ({items.length}개)
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className={styles.done}>
              <IconCircleCheckFilled size={56} className={styles.doneIcon} />
              <p className={styles.doneTitle}>재료 {items.length}개를 냉장고에 담았어요!</p>
              <span className={styles.beansReward}>🫘 콩알 +{EARN_BEANS} 획득</span>
              <div className={styles.footer}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => onComplete(items.length, EARN_BEANS)}
                >
                  확인
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
