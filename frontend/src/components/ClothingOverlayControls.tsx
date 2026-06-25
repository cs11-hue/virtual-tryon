"use client";

import { OVERLAY_LIMITS, patchOverlay } from "@/lib/overlay-bounds";
import type { ClothingOverlay } from "@/types/clothing";

export interface ClothingOverlayControlsProps {
  overlay: ClothingOverlay;
  onChange: (overlay: ClothingOverlay) => void;
  onReset: () => void;
}

export function ClothingOverlayControls({
  overlay,
  onChange,
  onReset,
}: ClothingOverlayControlsProps) {
  return (
    <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-800">옷 위치 · 크기 조절</p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-violet-600 hover:text-violet-500"
        >
          초기화
        </button>
      </div>

      <SliderRow
        label="크기"
        value={overlay.widthPercent}
        min={OVERLAY_LIMITS.widthPercent.min}
        max={OVERLAY_LIMITS.widthPercent.max}
        unit="%"
        onChange={(widthPercent) => onChange(patchOverlay(overlay, { widthPercent }))}
      />

      <SliderRow
        label="좌우"
        value={overlay.leftPercent}
        min={OVERLAY_LIMITS.leftPercent.min}
        max={OVERLAY_LIMITS.leftPercent.max}
        unit="%"
        onChange={(leftPercent) => onChange(patchOverlay(overlay, { leftPercent }))}
      />

      <SliderRow
        label="상하"
        value={overlay.topPercent}
        min={OVERLAY_LIMITS.topPercent.min}
        max={OVERLAY_LIMITS.topPercent.max}
        unit="%"
        onChange={(topPercent) => onChange(patchOverlay(overlay, { topPercent }))}
      />

      <SliderRow
        label="투명도"
        value={Math.round((overlay.opacity ?? 0.9) * 100)}
        min={Math.round(OVERLAY_LIMITS.opacity.min * 100)}
        max={Math.round(OVERLAY_LIMITS.opacity.max * 100)}
        unit="%"
        onChange={(opacityPercent) =>
          onChange(patchOverlay(overlay, { opacity: opacityPercent / 100 }))
        }
      />

      <p className="text-[11px] leading-relaxed text-slate-600">
        슬라이더를 움직이면 사진 위 옷이 바로 바뀝니다. 숫자가 변하는데 옷이
        안 움직이면 화면 위쪽 미리보기를 확인해 주세요.
      </p>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-[11px] font-medium text-slate-600">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-w-0 flex-1 accent-violet-600"
      />
      <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
        {Math.round(value)}
        {unit}
      </span>
    </label>
  );
}
