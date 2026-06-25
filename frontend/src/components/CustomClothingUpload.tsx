"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type DragEvent } from "react";

import { CLOTHING_CATEGORY_LABELS } from "@/constants/clothing-catalog";
import type { AddCustomClothingInput } from "@/hooks/useCustomClothing";
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/validate-image-file";
import type { ClothingCategory, ClothingItem } from "@/types/clothing";

const CATEGORY_OPTIONS = Object.entries(CLOTHING_CATEGORY_LABELS) as [
  ClothingCategory,
  string,
][];

export interface CustomClothingUploadProps {
  onAdd: (input: AddCustomClothingInput) => ClothingItem | string;
  onAdded?: (item: ClothingItem) => void;
}

export function CustomClothingUpload({
  onAdd,
  onAdded,
}: CustomClothingUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("top");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearPreview = useCallback(() => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }, []);

  const resetForm = useCallback(() => {
    setName("");
    setCategory("top");
    setPendingFile(null);
    setError(null);
    clearPreview();
    if (inputRef.current) inputRef.current.value = "";
  }, [clearPreview]);

  const handleClose = useCallback(() => {
    resetForm();
    setIsOpen(false);
    setIsDragging(false);
  }, [resetForm]);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      clearPreview();
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    },
    [clearPreview],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleSubmit = useCallback(() => {
    if (!pendingFile) {
      setError("옷 이미지를 업로드해 주세요.");
      return;
    }

    const result = onAdd({ file: pendingFile, name, category });
    if (typeof result === "string") {
      setError(result);
      return;
    }

    onAdded?.(result);
    handleClose();
  }, [pendingFile, name, category, onAdd, onAdded, handleClose]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={[
          "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition",
          "border-violet-300 text-violet-700 hover:border-violet-400 hover:bg-violet-50/50",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
        ].join(" ")}
      >
        <PlusIcon />
        내 옷 올리기
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">내 옷 추가</h3>
        <button
          type="button"
          onClick={handleClose}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          닫기
        </button>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            옷 이름 <span className="text-slate-400">(선택)</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="비워두면 자동으로 이름이 붙어요"
            maxLength={40}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            종류
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ClothingCategory)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-1 block text-xs font-medium text-slate-600">
            옷 이미지
          </span>
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              "relative flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed bg-white p-3 text-left transition",
              isDragging
                ? "border-violet-400 bg-violet-50"
                : "border-slate-300 hover:border-violet-300",
            ].join(" ")}
          >
            <input
              ref={inputRef}
              type="file"
              accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_EXTENSIONS.split(", ")].join(",")}
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {previewUrl ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={previewUrl}
                  alt="업로드할 옷 미리보기"
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <UploadIcon />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-700">
                {isDragging
                  ? "여기에 놓으세요"
                  : previewUrl
                    ? "다른 이미지 선택"
                    : "클릭 또는 드래그로 업로드"}
              </p>
              <p className="text-xs text-slate-500">
                {ACCEPTED_EXTENSIONS} · 최대 {MAX_FILE_SIZE_LABEL}
              </p>
            </div>
          </label>
        </div>

        {error && (
          <p className="text-xs text-rose-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          옷 목록에 추가
        </button>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
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
      className="h-6 w-6"
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
