import type { ClothingCategory, ClothingOverlay } from "@/types/clothing";

const DEFAULT_OVERLAY_BY_CATEGORY: Record<ClothingCategory, ClothingOverlay> = {
  top: { topPercent: 20, leftPercent: 22, widthPercent: 56, opacity: 0.92 },
  outer: { topPercent: 15, leftPercent: 16, widthPercent: 68, opacity: 0.9 },
  bottom: { topPercent: 46, leftPercent: 24, widthPercent: 52, opacity: 0.9 },
  dress: { topPercent: 14, leftPercent: 20, widthPercent: 60, opacity: 0.88 },
};

export function getDefaultOverlay(category: ClothingCategory): ClothingOverlay {
  return { ...DEFAULT_OVERLAY_BY_CATEGORY[category] };
}
