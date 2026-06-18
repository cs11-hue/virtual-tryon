import type { OutfitStyleKey } from "@/constants/outfit-styles";

/** 스타일별 가상 결과 이미지 (Unsplash) — 백엔드 연동 전 Mock */
export const MOCK_RESULT_IMAGES: Record<
  OutfitStyleKey,
  { url: string; alt: string }
> = {
  casual: {
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1200&fit=crop&q=80",
    alt: "캐주얼 스타일 패션 모델",
  },
  formal: {
    url: "https://images.unsplash.com/photo-1594932503098-63c08d06037a?w=900&h=1200&fit=crop&q=80",
    alt: "정장 스타일 패션 모델",
  },
  street: {
    url: "https://images.unsplash.com/photo-1552374196-1ab2a7c2b9f9?w=900&h=1200&fit=crop&q=80",
    alt: "스트릿 스타일 패션 모델",
  },
  sporty: {
    url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=1200&fit=crop&q=80",
    alt: "스포티 스타일 패션 모델",
  },
  minimal: {
    url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&h=1200&fit=crop&q=80",
    alt: "미니멀 스타일 패션 모델",
  },
};

export function getMockResultImage(styleKey: OutfitStyleKey): {
  url: string;
  alt: string;
} {
  return MOCK_RESULT_IMAGES[styleKey];
}
