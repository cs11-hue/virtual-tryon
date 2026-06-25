"use client";

import { useEffect, useRef, useState } from "react";

import { DraggableLayer, StaticLayer } from "@/components/DraggableLayer";
import type { GarmentLayerState } from "@/types/garment-layer";
import type { LayerTransform } from "@/types/layer";

type ActiveLayer = "photo" | string;

export interface TryOnPreviewProps {
  photoUrl: string;
  photoTransform: LayerTransform | null;
  onPhotoTransformChange?: (transform: LayerTransform) => void;
  photoAspect: number;
  garmentLayers: GarmentLayerState[];
  onGarmentTransformChange?: (clothingId: string, transform: LayerTransform) => void;
  compositedUrl: string | null;
  isCompositing?: boolean;
  interactive?: boolean;
}

export function TryOnPreview({
  photoUrl,
  photoTransform,
  onPhotoTransformChange,
  photoAspect,
  garmentLayers,
  onGarmentTransformChange,
  compositedUrl,
  isCompositing = false,
  interactive = false,
}: TryOnPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>("photo");

  useEffect(() => {
    if (garmentLayers.length === 0) {
      setActiveLayer("photo");
      return;
    }
    if (activeLayer !== "photo" && !garmentLayers.some((l) => l.clothing.id === activeLayer)) {
      setActiveLayer(garmentLayers[garmentLayers.length - 1].clothing.id);
    }
  }, [activeLayer, garmentLayers]);

  const canInteract = interactive && !compositedUrl && !isCompositing;
  const canInteractPhoto =
    canInteract && photoTransform && onPhotoTransformChange;
  const canInteractGarments =
    canInteract && garmentLayers.length > 0 && onGarmentTransformChange;

  const showLayers = !compositedUrl && photoTransform;

  const garmentCount = garmentLayers.length;
  const selectedLabel =
    garmentCount === 0
      ? null
      : garmentCount === 1
        ? garmentLayers[0].clothing.name
        : `${garmentCount}벌 선택`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">피팅 미리보기</p>
        {selectedLabel && (
          <span className="max-w-[55%] truncate rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
            {selectedLabel}
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
              전신 사진
            </button>
            {garmentLayers.map((layer) => (
              <button
                key={layer.clothing.id}
                type="button"
                onClick={() => setActiveLayer(layer.clothing.id)}
                className={[
                  "max-w-[9rem] truncate rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                  activeLayer === layer.clothing.id
                    ? "border-violet-500 bg-violet-50 text-violet-800 ring-2 ring-violet-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300",
                ].join(" ")}
              >
                {layer.clothing.name}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            조절할 항목을 고른 뒤 <strong>드래그</strong>로 옮기고{" "}
            <strong>더블클릭</strong>해 크기(%)를 입력하세요.
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
            alt="피팅 미리보기"
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
                  zIndex={activeLayer === "photo" ? 30 : 10}
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
              {garmentLayers.map((layer, index) => {
                const isActive = activeLayer === layer.clothing.id;
                const zIndex = isActive && canInteractGarments ? 30 : 20 + index;

                if (canInteractGarments && onGarmentTransformChange) {
                  return (
                    <DraggableLayer
                      key={layer.clothing.id}
                      imageUrl={layer.clothing.imageUrl}
                      alt={layer.clothing.name}
                      transform={layer.transform}
                      onTransformChange={(transform) =>
                        onGarmentTransformChange(layer.clothing.id, transform)
                      }
                      containerRef={containerRef}
                      aspect={layer.aspect}
                      zIndex={zIndex}
                      borderClassName="border-violet-500 bg-violet-400/15"
                      label={layer.clothing.name}
                      isActive={isActive}
                    />
                  );
                }

                return (
                  <StaticLayer
                    key={layer.clothing.id}
                    imageUrl={layer.clothing.imageUrl}
                    transform={layer.transform}
                    containerRef={containerRef}
                    aspect={layer.aspect}
                    zIndex={20 + index}
                    opacity={layer.transform.opacity}
                  />
                );
              })}
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
            {activeLayer === "photo"
              ? "전신 사진"
              : garmentLayers.find((l) => l.clothing.id === activeLayer)?.clothing
                  .name ?? "옷"}{" "}
            · 드래그 · 더블클릭
          </span>
        )}
      </div>
    </div>
  );
}
