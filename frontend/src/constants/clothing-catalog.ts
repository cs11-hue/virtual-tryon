import type { ClothingItem } from "@/types/clothing";

/** 입힐 수 있는 옷 목록 — API 연동 전 Mock 카탈로그 */
export const CLOTHING_CATALOG: readonly ClothingItem[] = [
  {
    id: "top-linen-shirt",
    name: "린넨 오픈 셔츠",
    category: "top",
    categoryLabel: "상의",
    imageUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop&q=85",
    overlay: { topPercent: 20, leftPercent: 22, widthPercent: 56, opacity: 0.92 },
    styleKey: "casual",
  },
  {
    id: "outer-blazer",
    name: "슬림 블레이저",
    category: "outer",
    categoryLabel: "아우터",
    imageUrl:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop&q=85",
    overlay: { topPercent: 16, leftPercent: 18, widthPercent: 64, opacity: 0.9 },
    styleKey: "formal",
  },
  {
    id: "bottom-denim",
    name: "하이웨이스트 데님",
    category: "bottom",
    categoryLabel: "하의",
    imageUrl:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop&q=85",
    overlay: { topPercent: 46, leftPercent: 24, widthPercent: 52, opacity: 0.9 },
    styleKey: "casual",
  },
  {
    id: "dress-midi",
    name: "플로럴 미디 원피스",
    category: "dress",
    categoryLabel: "원피스",
    imageUrl:
      "https://images.unsplash.com/photo-1595777458138-0c4f9a6d9887?w=600&h=800&fit=crop&q=85",
    overlay: { topPercent: 14, leftPercent: 20, widthPercent: 60, opacity: 0.88 },
    styleKey: "minimal",
  },
  {
    id: "outer-puffer",
    name: "숏 패딩 점퍼",
    category: "outer",
    categoryLabel: "아우터",
    imageUrl:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop&q=85",
    overlay: { topPercent: 15, leftPercent: 16, widthPercent: 68, opacity: 0.9 },
    styleKey: "street",
  },
  {
    id: "top-stripe-shirt",
    name: "스트라이프 셔츠",
    category: "top",
    categoryLabel: "상의",
    imageUrl:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop&q=85",
    overlay: { topPercent: 19, leftPercent: 20, widthPercent: 58, opacity: 0.92 },
    styleKey: "casual",
  },
  {
    id: "bottom-wide-wool",
    name: "와이드 울 팬츠",
    category: "bottom",
    categoryLabel: "하의",
    imageUrl:
      "https://images.unsplash.com/photo-1473966962634-7eaef2c04e93?w=600&h=800&fit=crop&q=85",
    overlay: { topPercent: 44, leftPercent: 22, widthPercent: 56, opacity: 0.9 },
    styleKey: "formal",
  },
  {
    id: "top-knit",
    name: "캐시미어 니트",
    category: "top",
    categoryLabel: "상의",
    imageUrl:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop&q=85",
    overlay: { topPercent: 21, leftPercent: 24, widthPercent: 54, opacity: 0.93 },
    styleKey: "minimal",
  },
] as const;

export const DEFAULT_CLOTHING_ID = CLOTHING_CATALOG[0].id;

export function getClothingById(id: string): ClothingItem | undefined {
  return CLOTHING_CATALOG.find((item) => item.id === id);
}

export const CLOTHING_CATEGORY_LABELS: Record<
  ClothingItem["category"],
  string
> = {
  top: "상의",
  bottom: "하의",
  dress: "원피스",
  outer: "아우터",
};
