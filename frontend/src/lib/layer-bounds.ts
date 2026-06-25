import type { LayerTransform } from "@/types/layer";

export const LAYER_LIMITS = {
  leftPercent: { min: -80, max: 95 },
  topPercent: { min: -80, max: 95 },
  widthPercent: { min: 8, max: 200 },
  opacity: { min: 0.35, max: 1 },
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeLayer(transform: LayerTransform): LayerTransform {
  return {
    leftPercent: clamp(
      transform.leftPercent,
      LAYER_LIMITS.leftPercent.min,
      LAYER_LIMITS.leftPercent.max,
    ),
    topPercent: clamp(
      transform.topPercent,
      LAYER_LIMITS.topPercent.min,
      LAYER_LIMITS.topPercent.max,
    ),
    widthPercent: clamp(
      transform.widthPercent,
      LAYER_LIMITS.widthPercent.min,
      LAYER_LIMITS.widthPercent.max,
    ),
    opacity: clamp(
      transform.opacity ?? 1,
      LAYER_LIMITS.opacity.min,
      LAYER_LIMITS.opacity.max,
    ),
  };
}

export function patchLayer(
  transform: LayerTransform,
  patch: Partial<LayerTransform>,
): LayerTransform {
  return normalizeLayer({ ...transform, ...patch });
}
