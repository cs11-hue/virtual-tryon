"use client";

import { TryOnPreview } from "@/components/TryOnPreview";
import { STYLING_LOADING_MESSAGE } from "@/types/styling";
import type { ClothingItem } from "@/types/clothing";

export interface StylingProgressProps {
  progress: number;
  previewUrl: string | null;
  clothing?: ClothingItem | null;
  compositedUrl?: string | null;
}

export function StylingProgress({
  progress,
  previewUrl,
  clothing = null,
  compositedUrl = null,
}: StylingProgressProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
          <SpinnerIcon />
        </div>
        <p className="text-sm font-medium text-slate-800">
          {STYLING_LOADING_MESSAGE}
        </p>
        {clothing && (
          <p className="mt-1 text-xs text-violet-600">
            「{clothing.name}」 적용 중
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500">{progress}% 완료</p>
      </div>

      <div className="space-y-2">
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="스타일링 진행률"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-slate-400">
          <span className={progress >= 10 ? "text-violet-600" : ""}>
            체형 분석
          </span>
          <span className={progress >= 50 ? "text-violet-600" : ""}>
            옷 매칭
          </span>
          <span className={progress >= 90 ? "text-violet-600" : ""}>
            합성 중
          </span>
        </div>
      </div>

      {previewUrl && clothing && (
        <TryOnPreview
          photoUrl={previewUrl}
          clothing={clothing}
          compositedUrl={compositedUrl}
          isCompositing={progress < 100}
          showOverlayPreview={!compositedUrl}
        />
      )}

      {previewUrl && !clothing && (
        <div className="relative aspect-[3/4] w-full animate-pulse overflow-hidden rounded-2xl bg-slate-200" />
      )}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="h-10 w-10 animate-spin text-violet-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
