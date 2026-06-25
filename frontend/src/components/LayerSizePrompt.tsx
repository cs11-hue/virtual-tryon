"use client";

import { useEffect, useId, useRef, useState } from "react";

import { LAYER_LIMITS } from "@/lib/layer-bounds";

export interface LayerSizePromptProps {
  open: boolean;
  label: string;
  widthPercent: number;
  onApply: (widthPercent: number) => void;
  onClose: () => void;
}

export function LayerSizePrompt({
  open,
  label,
  widthPercent,
  onApply,
  onClose,
}: LayerSizePromptProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(String(Math.round(widthPercent)));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValue(String(Math.round(widthPercent)));
    setError(null);
    const timer = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [open, widthPercent]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      setError("숫자를 입력해 주세요.");
      return;
    }
    if (
      parsed < LAYER_LIMITS.widthPercent.min ||
      parsed > LAYER_LIMITS.widthPercent.max
    ) {
      setError(
        `${LAYER_LIMITS.widthPercent.min}~${LAYER_LIMITS.widthPercent.max} 사이로 입력해 주세요.`,
      );
      return;
    }
    onApply(parsed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        role="dialog"
        aria-labelledby={`${inputId}-title`}
        className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3
          id={`${inputId}-title`}
          className="text-sm font-semibold text-slate-900"
        >
          {label} 크기
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          미리보기 너비 기준 % ({LAYER_LIMITS.widthPercent.min}~
          {LAYER_LIMITS.widthPercent.max})
        </p>

        <label htmlFor={inputId} className="mt-3 block text-xs font-medium text-slate-700">
          크기 (%)
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="number"
          min={LAYER_LIMITS.widthPercent.min}
          max={LAYER_LIMITS.widthPercent.max}
          step={1}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
        />
        {error && (
          <p role="alert" className="mt-2 text-xs text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500"
          >
            적용
          </button>
        </div>
      </form>
    </div>
  );
}
