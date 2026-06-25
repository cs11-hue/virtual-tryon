import type { LayerTransform } from "@/types/layer";

import {
  layerToPixelRect,
  PREVIEW_ASPECT,
  REF_CONTAINER,
} from "./layer-layout";

export interface GarmentCompositeInput {
  imageUrl: string;
  transform: LayerTransform;
}

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
 * 사용자 사진과 옷 레이어들을 합성해 Blob URL을 반환한다.
 */
export async function compositeTryOnImage(
  photoUrl: string,
  photoTransform: LayerTransform,
  garments: GarmentCompositeInput[],
): Promise<string> {
  const [photo, ...garmentImages] = await Promise.all([
    loadImage(photoUrl),
    ...garments.map((garment) => loadImage(garment.imageUrl)),
  ]);

  const canvasWidth = 900;
  const canvasHeight = Math.round(canvasWidth / PREVIEW_ASPECT);
  const container = {
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
  };

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_CONTEXT_FAILED");

  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const photoAspect =
    photo.naturalWidth > 0
      ? photo.naturalWidth / photo.naturalHeight
      : REF_CONTAINER.width / REF_CONTAINER.height;
  const photoRect = layerToPixelRect(container, photoTransform, photoAspect);
  ctx.drawImage(
    photo,
    photoRect.x,
    photoRect.y,
    photoRect.width,
    photoRect.height,
  );

  garments.forEach((garment, index) => {
    const image = garmentImages[index];
    if (!image) return;

    const garmentAspect =
      image.naturalWidth > 0
        ? image.naturalWidth / image.naturalHeight
        : 0.75;
    const garmentRect = layerToPixelRect(
      container,
      garment.transform,
      garmentAspect,
    );

    ctx.globalAlpha = garment.transform.opacity ?? 0.92;
    ctx.drawImage(
      image,
      garmentRect.x,
      garmentRect.y,
      garmentRect.width,
      garmentRect.height,
    );
  });
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
