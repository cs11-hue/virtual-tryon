import type { ClothingItem } from "@/types/clothing";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    image.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

/**
 * 사용자 사진 위에 선택한 옷 이미지를 합성해 Blob URL을 반환한다.
 * (백엔드 AI 피팅 연동 전 Mock)
 */
export async function compositeTryOnImage(
  photoUrl: string,
  clothing: ClothingItem,
): Promise<string> {
  const [photo, garment] = await Promise.all([
    loadImage(photoUrl),
    loadImage(clothing.imageUrl),
  ]);

  const width = photo.naturalWidth || photo.width;
  const height = photo.naturalHeight || photo.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_CONTEXT_FAILED");

  drawCover(ctx, photo, width, height);

  const garmentWidth = (width * clothing.overlay.widthPercent) / 100;
  const garmentHeight = (garment.height / garment.width) * garmentWidth;
  const left = (width * clothing.overlay.leftPercent) / 100;
  const top = (height * clothing.overlay.topPercent) / 100;

  ctx.globalAlpha = clothing.overlay.opacity ?? 0.9;
  ctx.drawImage(garment, left, top, garmentWidth, garmentHeight);
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
