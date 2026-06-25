"use client";

import { useRef } from "react";

import {
  DraggableGarmentOverlay,
  StaticGarmentOverlay,
} from "@/components/DraggableGarmentOverlay";
import { useImageNaturalSize } from "@/hooks/useImageNaturalSize";
import type { ClothingItem, ClothingOverlay } from "@/types/clothing";

const FALLBACK_PHOTO_SIZE = { width: 3, height: 4 };

export interface TryOnPreviewProps {
  photoUrl: string;
  clothing: ClothingItem | null;
  overlay: ClothingOverlay | null;
  onOverlayChange?: (overlay: ClothingOverlay) => void;
  compositedUrl: string | null;
  isCompositing?: boolean;
  interactive?: boolean;
}

export function TryOnPreview({
  photoUrl,
  clothing,
  overlay,
  onOverlayChange,
  compositedUrl,
  isCompositing = false,
  interactive = false,
}: TryOnPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { imgRef, naturalSize, handleLoad } = useImageNaturalSize(photoUrl);
  const photoNaturalSize = naturalSize ?? FALLBACK_PHOTO_SIZE;

  const showGarment = Boolean(clothing && overlay && !compositedUrl);
  const canInteract =
    interactive &&
    clothing &&
    overlay &&
    onOverlayChange &&
    !compositedUrl &&
    !isCompositing;

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
        <div className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-sm text-violet-900">
          <strong>드래그</strong>로 옷을 옮기고, <strong>더블클릭</strong>으로
          크기를 바꿀 수 있어요.
        </div>
      )}

      <div
        ref={containerRef}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner"
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
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={photoUrl}
              alt="업로드한 전신 사진"
              className={[
                "h-full w-full object-contain",
                canInteract ? "pointer-events-none select-none" : "",
              ].join(" ")}
              onLoad={handleLoad}
              draggable={false}
            />
            {showGarment && canInteract && clothing && overlay && (
              <DraggableGarmentOverlay
                clothing={clothing}
                overlay={overlay}
                onOverlayChange={onOverlayChange}
                containerRef={containerRef}
                photoNaturalSize={photoNaturalSize}
              />
            )}
            {showGarment && !canInteract && clothing && overlay && (
              <StaticGarmentOverlay
                clothing={clothing}
                overlay={overlay}
                onOverlayChange={() => {}}
                containerRef={containerRef}
                photoNaturalSize={photoNaturalSize}
              />
            )}
          </>
        )}

        {isCompositing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-violet-700 shadow">
              합성 중...
            </span>
          </div>
        )}

        {clothing && !isCompositing && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-md bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {canInteract
              ? "드래그 이동 · 더블클릭 크기"
              : compositedUrl
                ? "합성 미리보기"
                : "미리보기"}
          </span>
        )}
      </div>
    </div>
  );
}

export function PhotoPreviewFrame({
  photoUrl,
  onChangePhoto,
  onClearPhoto,
}: {
  photoUrl: string;
  onChangePhoto: () => void;
  onClearPhoto: () => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">업로드한 전신 사진</p>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt="업로드한 전신 사진"
          className="h-full w-full object-contain p-2"
        />
      </div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={onChangePhoto}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-300"
        >
          다른 사진
        </button>
        <button
          type="button"
          onClick={onClearPhoto}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600"
        >
          사진 삭제
        </button>
      </div>
    </div>
  );
}
