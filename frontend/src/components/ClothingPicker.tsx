"use client";

import Image from "next/image";

import { CustomClothingUpload } from "@/components/CustomClothingUpload";
import type { AddCustomClothingInput } from "@/hooks/useCustomClothing";
import type { ClothingItem } from "@/types/clothing";

export interface ClothingPickerProps {
  items: ClothingItem[];
  selectedIds: string[];
  onToggle: (item: ClothingItem) => void;
  onAddCustom: (input: AddCustomClothingInput) => ClothingItem | string;
  onCustomAdded?: (item: ClothingItem) => void;
  onRemoveCustom?: (id: string) => void;
  disabled?: boolean;
}

function isLocalImageUrl(url: string): boolean {
  return url.startsWith("blob:") || url.startsWith("data:");
}

export function ClothingPicker({
  items,
  selectedIds,
  onToggle,
  onAddCustom,
  onCustomAdded,
  onRemoveCustom,
  disabled = false,
}: ClothingPickerProps) {
  const customCount = items.filter((item) => item.isCustom).length;
  const selectedSet = new Set(selectedIds);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">
          입힐 옷 선택
        </label>
        <span className="text-xs text-slate-400">
          {items.length}벌
          {customCount > 0 ? ` · 내 옷 ${customCount}` : ""}
          {selectedIds.length > 0 ? ` · ${selectedIds.length}벌 선택` : ""}
        </span>
      </div>

      <CustomClothingUpload onAdd={onAddCustom} onAdded={onCustomAdded} />

      {disabled ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
          전신 사진을 먼저 올려 주세요. 그다음 옷을 고르거나 내 옷을 추가할 수
          있습니다.
        </p>
      ) : (
        <div
          role="listbox"
          aria-label="입힐 옷 목록"
          aria-multiselectable="true"
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
        >
          {items.map((item) => {
            const isSelected = selectedSet.has(item.id);
            return (
              <div key={item.id} className="group relative">
                {item.isCustom && onRemoveCustom && !disabled && (
                  <button
                    type="button"
                    aria-label={`${item.name} 삭제`}
                    onClick={() => onRemoveCustom(item.id)}
                    className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition hover:bg-rose-600 group-hover:opacity-100"
                  >
                    <RemoveIcon />
                  </button>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={disabled}
                  onClick={() => onToggle(item)}
                  className={[
                    "group relative w-full overflow-hidden rounded-xl border-2 bg-white text-left transition-all",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
                    isSelected
                      ? "border-violet-500 shadow-md shadow-violet-500/20 ring-2 ring-violet-200"
                      : "border-slate-200 hover:border-violet-300 hover:shadow-sm",
                  ].join(" ")}
                >
                  <div className="relative aspect-square w-full bg-slate-50">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="120px"
                      unoptimized={isLocalImageUrl(item.imageUrl)}
                    />
                    {item.isCustom && (
                      <span className="absolute bottom-1 left-1 rounded bg-violet-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white">
                        내 옷
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white shadow">
                        <CheckIcon />
                      </span>
                    )}
                  </div>
                  <div className="px-2 py-2">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {item.categoryLabel}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedIds.length === 0 && (
        <p className="text-center text-xs text-amber-600" role="status">
          {disabled
            ? "내 옷은 지금 바로 올릴 수 있어요. 전신 사진을 올리면 선택한 옷을 미리 입혀볼 수 있습니다."
            : "옷을 눌러 선택하세요. 여러 벌을 함께 입힐 수 있어요."}
        </p>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3 w-3"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3 w-3"
      aria-hidden
    >
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}
