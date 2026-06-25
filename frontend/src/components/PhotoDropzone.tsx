"use client";

import Image from "next/image";
import { useCallback, type DragEvent, type KeyboardEvent } from "react";

import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/validate-image-file";

export interface PhotoDropzoneProps {
  previewUrl: string | null;
  error: string | null;
  isDragging: boolean;
  onFileSelect: (file: File) => void;
  onDragStateChange: (isDragging: boolean) => void;
  onOpenPicker: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export function PhotoDropzone({
  previewUrl,
  error,
  isDragging,
  onFileSelect,
  onDragStateChange,
  onOpenPicker,
  onClear,
  disabled = false,
}: PhotoDropzoneProps) {
  const hasPreview = Boolean(previewUrl);

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!disabled) onDragStateChange(true);
    },
    [disabled, onDragStateChange],
  );

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      onDragStateChange(false);
    },
    [onDragStateChange],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      onDragStateChange(false);
      if (disabled) return;

      const file = event.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [disabled, onDragStateChange, onFileSelect],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpenPicker();
      }
    },
    [disabled, onOpenPicker],
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="전신 사진 업로드. 클릭하거나 파일을 끌어다 놓으세요."
        aria-disabled={disabled}
        aria-describedby="dropzone-hint dropzone-error"
        onClick={() => !disabled && !hasPreview && onOpenPicker()}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          isDragging
            ? "scale-[1.01] border-violet-400 bg-violet-50/80"
            : error
              ? "border-rose-300 bg-rose-50/40"
              : hasPreview
                ? "border-slate-200 bg-slate-50"
                : "border-slate-300 bg-white/60 hover:border-violet-300 hover:bg-violet-50/30",
        ].join(" ")}
      >
        {hasPreview && previewUrl ? (
          <div className="relative aspect-[3/4] w-full min-h-[320px]">
            <Image
              src={previewUrl}
              alt="업로드한 전신 사진 미리보기"
              fill
              className="object-contain p-4"
              unoptimized
              sizes="(max-width: 768px) 100vw, 480px"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-slate-900/70 to-transparent p-4 pt-12">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPicker();
                }}
                disabled={disabled}
                className="rounded-lg bg-white/95 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white"
              >
                다른 사진 선택
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                disabled={disabled}
                className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/30"
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <div
              className={[
                "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
                isDragging
                  ? "bg-violet-100 text-violet-600"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
              aria-hidden
            >
              <UploadIcon />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                {isDragging ? "여기에 놓으세요" : "전신 사진을 업로드하세요"}
              </p>
              <p id="dropzone-hint" className="mt-1 text-sm text-slate-500">
                드래그 앤 드롭 또는 클릭 · {ACCEPTED_EXTENSIONS} · 최대{" "}
                {MAX_FILE_SIZE_LABEL}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p
          id="dropzone-error"
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          <AlertIcon />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-8 w-8"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="mt-0.5 h-5 w-5 shrink-0"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0010 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
