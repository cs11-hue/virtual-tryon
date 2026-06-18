"use client";

import Image from "next/image";

import type { ClothingItem } from "@/types/clothing";

export interface TryOnPreviewProps {
  photoUrl: string;
  clothing: ClothingItem | null;
  compositedUrl: string | null;
  isCompositing?: boolean;
  showOverlayPreview?: boolean;
}

export function TryOnPreview({
  photoUrl,
  clothing,
  compositedUrl,
  isCompositing = false,
  showOverlayPreview = true,
}: TryOnPreviewProps) {
  const displayUrl = compositedUrl ?? photoUrl;
  const showCssOverlay =
    showOverlayPreview && !compositedUrl && clothing && !isCompositing;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">피팅 미리보기</p>
        {clothing && (
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
            {clothing.name}
          </span>
        )}
      </div>

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
        {compositedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
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
              src={photoUrl}
              alt="업로드한 전신 사진"
              className="h-full w-full object-contain"
            />
            {showCssOverlay && clothing && (
              <GarmentOverlay clothing={clothing} />
            )}
          </>
        )}

        {isCompositing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-violet-700 shadow">
              합성 중...
            </span>
          </div>
        )}

        {clothing && !isCompositing && (
          <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {compositedUrl ? "합성 미리보기" : "실시간 오버레이"}
          </span>
        )}
      </div>
    </div>
  );
}

function GarmentOverlay({ clothing }: { clothing: ClothingItem }) {
  const { topPercent, leftPercent, widthPercent, opacity } = clothing.overlay;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      <div
        className="absolute"
        style={{
          top: `${topPercent}%`,
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          opacity: opacity ?? 0.9,
        }}
      >
        <Image
          src={clothing.imageUrl}
          alt=""
          width={400}
          height={500}
          className="h-auto w-full object-contain drop-shadow-lg"
          unoptimized
        />
      </div>
    </div>
  );
}
