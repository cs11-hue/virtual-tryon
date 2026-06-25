import type { LayerTransform } from "@/types/layer";

import {
  getObjectContainRect,
  overlayToPixelRect,
  type LayoutRect,
} from "./object-contain-layout";

export const PREVIEW_ASPECT = 3 / 4;

/** 퍼센트 계산용 기준 컨테이너 (실제 크기와 무관하게 비율만 유지) */
export const REF_CONTAINER = {
  x: 0,
  y: 0,
  width: 100,
  height: 100 / PREVIEW_ASPECT,
} as const;

export function layerToPixelRect(
  container: LayoutRect,
  transform: LayerTransform,
  aspect: number,
): LayoutRect {
  const safeAspect = aspect > 0 ? aspect : 1;
  const width = (container.width * transform.widthPercent) / 100;
  const height = width / safeAspect;

  return {
    x: (container.width * transform.leftPercent) / 100,
    y: (container.height * transform.topPercent) / 100,
    width,
    height,
  };
}

export function pixelRectToLayer(
  container: LayoutRect,
  pixelRect: LayoutRect,
): Pick<LayerTransform, "leftPercent" | "topPercent" | "widthPercent"> {
  return {
    leftPercent: (pixelRect.x / container.width) * 100,
    topPercent: (pixelRect.y / container.height) * 100,
    widthPercent: (pixelRect.width / container.width) * 100,
  };
}

export function getDefaultPhotoTransform(
  naturalWidth: number,
  naturalHeight: number,
): LayerTransform {
  const contain = getObjectContainRect(
    REF_CONTAINER.width,
    REF_CONTAINER.height,
    naturalWidth,
    naturalHeight,
  );
  return pixelRectToLayer(REF_CONTAINER, contain);
}

export function getDefaultGarmentTransform(
  photoTransform: LayerTransform,
  photoAspect: number,
  garmentOverlay: {
    topPercent: number;
    leftPercent: number;
    widthPercent: number;
    opacity?: number;
  },
  garmentAspect: number,
): LayerTransform {
  const photoRect = layerToPixelRect(REF_CONTAINER, photoTransform, photoAspect);
  const garmentPixel = overlayToPixelRect(
    photoRect,
    garmentOverlay,
    garmentAspect,
  );
  return {
    ...pixelRectToLayer(REF_CONTAINER, garmentPixel),
    opacity: garmentOverlay.opacity,
  };
}
