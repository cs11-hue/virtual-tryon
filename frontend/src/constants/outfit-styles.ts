/** API 키와 UI 라벨을 한 곳에서만 정의 (백엔드 STYLE_PROMPTS와 동기화) */
export type OutfitStyleKey =
  | "casual"
  | "formal"
  | "street"
  | "sporty"
  | "minimal";

export interface OutfitStyleOption {
  key: OutfitStyleKey;
  label: string;
  description: string;
}

export const OUTFIT_STYLES: readonly OutfitStyleOption[] = [
  {
    key: "casual",
    label: "캐주얼",
    description: "편안한 데일리 룩",
  },
  {
    key: "formal",
    label: "정장",
    description: "단정한 포멀 스타일",
  },
  {
    key: "street",
    label: "스트릿",
    description: "트렌디한 스트릿 패션",
  },
  {
    key: "sporty",
    label: "스포티",
    description: "활동적인 애슬레저",
  },
  {
    key: "minimal",
    label: "미니멀",
    description: "깔끔한 무채색 톤",
  },
] as const;

export const DEFAULT_STYLE_KEY: OutfitStyleKey = "casual";
