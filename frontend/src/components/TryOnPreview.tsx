"use client";

import { useEffect, useRef, useState } from "react";

import { DraggableLayer, StaticLayer } from "@/components/DraggableLayer";
import type { ClothingItem } from "@/types/clothing";
import type { LayerTransform } from "@/types/layer";

type ActiveLayer = "photo" | "garment";

export interface TryOnPreviewProps {
  photoUrl: string;
  photoTransform: LayerTransform | null;
  onPhotoTransformChange?: (transform: LayerTransform) => void;
  photoAspect: number;
  clothing: ClothingItem | null;
  garmentTransform: LayerTransform | null;
  onGarmentTransformChange?: (transform: LayerTransform) => void;
  garmentAspect: number;
  compositedUrl: string | null;
  isCompositing?: boolean;
  interactive?: boolean;
}

export function TryOnPreview({
  photoUrl,
  photoTransform,
  onPhotoTransformChange,
  photoAspect,
  clothing,
  garmentTransform,
  onGarmentTransformChange,
  garmentAspect,
  compositedUrl,
  isCompositing = false,
  interactive = false,
}: TryOnPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>("photo");

  useEffect(() => {
    setActiveLayer(clothing ? "garment" : "photo");
  }, [clothing?.id, clothing]);

  const canInteract =
    interactive && !compositedUrl && !isCompositing;

  const canInteractPhoto =
    canInteract && photoTransform && onPhotoTransformChange;

  const canInteractGarment =
    canInteract &&
    clothing &&
    garmentTransform &&
    onGarmentTransformChange;

  const showLayers = !compositedUrl && photoTransform;

  const photoZIndex =
    activeLayer === "photo" && canInteractPhoto ? 30 : 10;
  const garmentZIndex =
    activeLayer === "garment" && canInteractGarment ? 30 : 20;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">피팅 미리보기</p>
        {clothing && (
          <span className="max-w-[55%] truncate rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
            {clothing.name}
          </span>
        )}
      </div>

      {canInteract && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveLayer("photo")}
              className={[
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                activeLayer === "photo"
                  ? "border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-300",
              ].join(" ")}
            >
              전신 사진 조절
            </button>
            {clothing && (
              <button
                type="button"
                onClick={() => setActiveLayer("garment")}
                className={[
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                  activeLayer === "garment"
                    ? "border-violet-500 bg-violet-50 text-violet-800 ring-2 ring-violet-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300",
                ].join(" ")}
              >
                옷 조절
              </button>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            위에서 조절할 대상을 고른 뒤, <strong>드래그</strong>로 옮기고{" "}
            <strong>더블클릭</strong>하면 크기를 숫자로 입력할 수 있어요.
          </div>
        </>
      )}

      <div
        ref={containerRef}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-inner"
      >
        {compositedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={compositedUrl}
            alt={
              clothing
                ? `${clothing.name}을 입힌 미리보기`
                : "피팅 미리보기"
            }
            className="h-full w-full object-contain"
          />
        ) : (
          showLayers && (
            <>
              {canInteractPhoto && photoTransform && onPhotoTransformChange ? (
                <DraggableLayer
                  imageUrl={photoUrl}
                  alt="업로드한 전신 사진"
                  transform={photoTransform}
                  onTransformChange={onPhotoTransformChange}
                  containerRef={containerRef}
                  aspect={photoAspect}
                  zIndex={photoZIndex}
                  borderClassName="border-sky-500 bg-sky-400/10"
                  label="전신 사진"
                  isActive={activeLayer === "photo"}
                />
              ) : (
                <StaticLayer
                  imageUrl={photoUrl}
                  transform={photoTransform}
                  containerRef={containerRef}
                  aspect={photoAspect}
                  zIndex={10}
                />
              )}
              {clothing &&
                garmentTransform &&
                (canInteractGarment && onGarmentTransformChange ? (
                  <DraggableLayer
                    imageUrl={clothing.imageUrl}
                    alt={clothing.name}
                    transform={garmentTransform}
                    onTransformChange={onGarmentTransformChange}
                    containerRef={containerRef}
                    aspect={garmentAspect}
                    zIndex={garmentZIndex}
                    borderClassName="border-violet-500 bg-violet-400/15"
                    label="옷"
                    isActive={activeLayer === "garment"}
                  />
                ) : (
                  <StaticLayer
                    imageUrl={clothing.imageUrl}
                    transform={garmentTransform}
                    containerRef={containerRef}
                    aspect={garmentAspect}
                    zIndex={20}
                    opacity={garmentTransform.opacity}
                  />
                ))}
            </>
          )
        )}

        {isCompositing && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-violet-700 shadow">
              합성 중...
            </span>
          </div>
        )}

        {canInteract && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-40 rounded-md bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {activeLayer === "photo" ? "전신 사진" : "옷"} · 드래그 이동 ·
            더블클릭 크기 입력
          </span>
        )}
      </div>
    </div>
  );
}
