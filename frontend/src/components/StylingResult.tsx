"use client";

import { useCallback, useState } from "react";

import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { downloadBlobUrl } from "@/lib/download-image";
import type { ClothingItem } from "@/types/clothing";

export interface StylingResultProps {
  originalUrl: string;
  afterUrl: string;
  clothing: ClothingItem;
  onRetry: () => void;
}

export function StylingResult({
  originalUrl,
  afterUrl,
  clothing,
  onRetry,
}: StylingResultProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    setDownloadError(null);

    const filename = `virtual-tryon-${clothing.id}-${Date.now()}.jpg`;

    try {
      await downloadBlobUrl(afterUrl, filename);
    } catch {
      setDownloadError("이미지를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsDownloading(false);
    }
  }, [afterUrl, clothing.id]);

  return (
    <div className="space-y-6" role="region" aria-labelledby="result-title">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <CheckIcon />
          피팅 완료
        </span>
        <h3
          id="result-title"
          className="mt-3 text-lg font-bold text-slate-900 sm:text-xl"
        >
          {clothing.name}을 입혔습니다
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {clothing.categoryLabel} · 내 사진 위 가상 피팅 결과
        </p>
      </div>

      <BeforeAfterSlider
        beforeSrc={originalUrl}
        afterSrc={afterUrl}
        beforeAlt="업로드한 원본 전신 사진"
        afterAlt={`${clothing.name}을 입힌 결과`}
        beforeLabel="원본"
        afterLabel="피팅 결과"
        beforeUnoptimized
        afterUnoptimized
      />

      {downloadError && (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800"
        >
          {downloadError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          aria-busy={isDownloading}
          className={[
            "flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition",
            "hover:from-violet-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
            "disabled:cursor-not-allowed disabled:opacity-70",
          ].join(" ")}
        >
          <DownloadIcon />
          {isDownloading ? "저장 중..." : "이미지 다운로드"}
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        >
          다른 옷 시도하기
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
  );
}
