"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  OUTFIT_STYLES,
  type OutfitStyleKey,
} from "@/constants/outfit-styles";

export interface StyleSelectProps {
  value: OutfitStyleKey;
  onChange: (key: OutfitStyleKey) => void;
  disabled?: boolean;
}

export function StyleSelect({
  value,
  onChange,
  disabled = false,
}: StyleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const labelId = useId();

  const selected =
    OUTFIT_STYLES.find((style) => style.key === value) ?? OUTFIT_STYLES[0];

  const close = useCallback(() => setIsOpen(false), []);

  const selectOption = useCallback(
    (key: OutfitStyleKey) => {
      onChange(key);
      close();
    },
    [onChange, close],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, close]);

  return (
    <div ref={containerRef} className="relative w-full">
      <label id={labelId} className="mb-2 block text-sm font-medium text-slate-700">
        옷 스타일
      </label>

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        aria-controls={listboxId}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={[
          "flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
          disabled
            ? "cursor-not-allowed border-slate-200 opacity-60"
            : "border-slate-200 hover:border-violet-300 hover:shadow-md",
        ].join(" ")}
      >
        <span>
          <span className="block text-sm font-semibold text-slate-900">
            {selected.label}
          </span>
          <span className="block text-xs text-slate-500">
            {selected.description}
          </span>
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
        >
          {OUTFIT_STYLES.map((style) => {
            const isSelected = style.key === value;
            return (
              <li key={style.key} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectOption(style.key)}
                  className={[
                    "flex w-full flex-col px-4 py-3 text-left transition",
                    isSelected
                      ? "bg-violet-50 text-violet-900"
                      : "text-slate-800 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className="text-sm font-semibold">{style.label}</span>
                  <span className="text-xs text-slate-500">
                    {style.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={[
        "h-5 w-5 shrink-0 text-slate-400 transition-transform",
        open ? "rotate-180" : "",
      ].join(" ")}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}
