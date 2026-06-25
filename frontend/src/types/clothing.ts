import type { OutfitStyleKey } from "@/constants/outfit-styles";

export type ClothingCategory = "top" | "bottom" | "dress" | "outer";

/** 사진 위 옷 오버레이 위치 (0–100%) */
export interface ClothingOverlay {
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  opacity?: number;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  categoryLabel: string;
  imageUrl: string;
  overlay: ClothingOverlay;
  styleKey: OutfitStyleKey;
  /** 사용자가 직접 업로드한 옷 */
  isCustom?: boolean;
}
