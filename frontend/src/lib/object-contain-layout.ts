export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getObjectContainRect(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): LayoutRect {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    naturalWidth <= 0 ||
    naturalHeight <= 0
  ) {
    return { x: 0, y: 0, width: containerWidth, height: containerHeight };
  }

  const scale = Math.min(
    containerWidth / naturalWidth,
    containerHeight / naturalHeight,
  );
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;

  return {
    x: (containerWidth - width) / 2,
    y: (containerHeight - height) / 2,
    width,
    height,
  };
}

export function overlayToPixelRect(
  imageRect: LayoutRect,
  overlay: { topPercent: number; leftPercent: number; widthPercent: number },
  garmentAspect: number,
): LayoutRect {
  const safeAspect = garmentAspect > 0 ? garmentAspect : 0.75;
  const width = (imageRect.width * overlay.widthPercent) / 100;
  const height = width / safeAspect;

  return {
    x: imageRect.x + (imageRect.width * overlay.leftPercent) / 100,
    y: imageRect.y + (imageRect.height * overlay.topPercent) / 100,
    width,
    height,
  };
}

export function pixelRectToOverlay(
  imageRect: LayoutRect,
  pixelRect: LayoutRect,
): {
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
} {
  return {
    leftPercent: ((pixelRect.x - imageRect.x) / imageRect.width) * 100,
    topPercent: ((pixelRect.y - imageRect.y) / imageRect.height) * 100,
    widthPercent: (pixelRect.width / imageRect.width) * 100,
  };
}
