import type { ClothingOverlay } from "@/types/clothing";

export const OVERLAY_LIMITS = {
  leftPercent: { min: -50, max: 95 },
  topPercent: { min: -50, max: 95 },
  widthPercent: { min: 5, max: 160 },
  opacity: { min: 0.35, max: 1 },
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeOverlay(overlay: ClothingOverlay): ClothingOverlay {
  return {
    leftPercent: clamp(
      overlay.leftPercent,
      OVERLAY_LIMITS.leftPercent.min,
      OVERLAY_LIMITS.leftPercent.max,
    ),
    topPercent: clamp(
      overlay.topPercent,
      OVERLAY_LIMITS.topPercent.min,
      OVERLAY_LIMITS.topPercent.max,
    ),
    widthPercent: clamp(
      overlay.widthPercent,
      OVERLAY_LIMITS.widthPercent.min,
      OVERLAY_LIMITS.widthPercent.max,
    ),
    opacity: clamp(
      overlay.opacity ?? 0.9,
      OVERLAY_LIMITS.opacity.min,
      OVERLAY_LIMITS.opacity.max,
    ),
  };
}

export function patchOverlay(
  overlay: ClothingOverlay,
  patch: Partial<ClothingOverlay>,
): ClothingOverlay {
  return normalizeOverlay({ ...overlay, ...patch });
}
