import type { ClothingOverlay } from "@/types/clothing";

import { overlayToPixelRect } from "./object-contain-layout";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      image.crossOrigin = "anonymous";
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    image.src = src;
  });
}

/**
 * 사용자 사진 위에 선택한 옷 이미지를 합성해 Blob URL을 반환한다.
 * (백엔드 AI 피팅 연동 전 Mock)
 */
export async function compositeTryOnImage(
  photoUrl: string,
  garmentUrl: string,
  overlay: ClothingOverlay,
): Promise<string> {
  const [photo, garment] = await Promise.all([
    loadImage(photoUrl),
    loadImage(garmentUrl),
  ]);

  const width = photo.naturalWidth || photo.width;
  const height = photo.naturalHeight || photo.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_CONTEXT_FAILED");

  ctx.drawImage(photo, 0, 0, width, height);

  const imageRect = { x: 0, y: 0, width, height };
  const garmentAspect =
    garment.naturalWidth > 0
      ? garment.naturalWidth / garment.naturalHeight
      : 0.75;
  const pixelRect = overlayToPixelRect(imageRect, overlay, garmentAspect);

  ctx.globalAlpha = overlay.opacity ?? 0.9;
  ctx.drawImage(
    garment,
    pixelRect.x,
    pixelRect.y,
    pixelRect.width,
    pixelRect.height,
  );
  ctx.globalAlpha = 1;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("BLOB_FAILED"));
      },
      "image/jpeg",
      0.92,
    );
  });

  return URL.createObjectURL(blob);
}
