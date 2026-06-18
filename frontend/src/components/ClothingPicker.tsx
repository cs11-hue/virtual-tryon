"use client";

import Image from "next/image";

import { CLOTHING_CATALOG } from "@/constants/clothing-catalog";
import type { ClothingItem } from "@/types/clothing";

export interface ClothingPickerProps {
  selectedId: string | null;
  onSelect: (item: ClothingItem) => void;
  disabled?: boolean;
}

export function ClothingPicker({
  selectedId,
  onSelect,
  disabled = false,
}: ClothingPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">
          입힐 옷 선택
        </label>
        <span className="text-xs text-slate-400">
          {CLOTHING_CATALOG.length}벌
        </span>
      </div>

      <div
        role="listbox"
        aria-label="입힐 옷 목록"
        aria-disabled={disabled}
        className={[
          "grid grid-cols-2 gap-2.5 sm:grid-cols-4",
          disabled ? "pointer-events-none opacity-50" : "",
        ].join(" ")}
      >
        {CLOTHING_CATALOG.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={disabled}
              onClick={() => onSelect(item)}
              className={[
                "group relative overflow-hidden rounded-xl border-2 bg-white text-left transition-all",
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
                />
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
          );
        })}
      </div>

      {!selectedId && !disabled && (
        <p className="text-center text-xs text-amber-600" role="status">
          옷을 선택하면 사진 위에 미리 입혀집니다.
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
