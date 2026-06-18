"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

export interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeUnoptimized?: boolean;
  afterUnoptimized?: boolean;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel = "원본",
  afterLabel = "스타일링 결과",
  beforeUnoptimized = false,
  afterUnoptimized = false,
}: BeforeAfterSliderProps) {
  const afterIsBlob = afterSrc.startsWith("blob:");
  const useAfterImg = afterUnoptimized || afterIsBlob;
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [containerWidth, setContainerWidth] = useState(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => setContainerWidth(element.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const setPositionFromClientX = useCallback((clientX: number) => {
    const element = containerRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const next = Math.round(Math.min(100, Math.max(0, ratio * 100)));
    setPosition(next);
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setPositionFromClientX(event.clientX);
    },
    [setPositionFromClientX],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      setPositionFromClientX(event.clientX);
    },
    [setPositionFromClientX],
  );

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((prev) => Math.max(0, prev - 5));
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((prev) => Math.min(100, prev + 5));
    }
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-slate-500">
        슬라이더를 드래그해 원본과 스타일링 결과를 비교해 보세요
      </p>

      <div
        ref={containerRef}
        className="relative aspect-[3/4] w-full select-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="slider"
        aria-label="원본과 스타일링 결과 비교 슬라이더"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={position}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* After (피팅 결과) — 전체 배경 */}
        {useAfterImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={afterSrc}
            alt={afterAlt}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={afterSrc}
            alt={afterAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
            draggable={false}
          />
        )}

        {/* Before (원본) — 왼쪽 클립 */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${position}%` }}
          aria-hidden={position === 0}
        >
          {beforeUnoptimized ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={beforeSrc}
              alt={beforeAlt}
              draggable={false}
              className="absolute left-0 top-0 h-full max-w-none object-cover"
              style={{ width: containerWidth || "100%" }}
            />
          ) : (
            <Image
              src={beforeSrc}
              alt={beforeAlt}
              width={containerWidth || 400}
              height={533}
              className="absolute left-0 top-0 h-full max-w-none object-cover"
              style={{ width: containerWidth || "100%" }}
              unoptimized={beforeUnoptimized}
              draggable={false}
            />
          )}
        </div>

        {/* 구분선 & 핸들 */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]"
          style={{ left: `${position}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-violet-600 shadow-lg">
            <GripIcon />
          </div>
        </div>

        <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-md bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-md bg-violet-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>

      {/* 나란히 미리보기 (정적) */}
      <div className="grid grid-cols-2 gap-3">
        <SidePreview
          src={beforeSrc}
          alt={beforeAlt}
          label={beforeLabel}
          unoptimized={beforeUnoptimized}
          variant="before"
        />
        <SidePreview
          src={afterSrc}
          alt={afterAlt}
          label={afterLabel}
          variant="after"
        />
      </div>
    </div>
  );
}

function SidePreview({
  src,
  alt,
  label,
  unoptimized,
  variant,
}: {
  src: string;
  alt: string;
  label: string;
  unoptimized?: boolean;
  variant: "before" | "after";
}) {
  const isBlob = src.startsWith("blob:");

  return (
    <div
      className={[
        "overflow-hidden rounded-xl border bg-slate-50",
        variant === "after"
          ? "border-violet-200 ring-1 ring-violet-100"
          : "border-slate-200",
      ].join(" ")}
    >
      <div className="relative aspect-[3/4] w-full">
        {isBlob ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="200px"
            unoptimized={unoptimized}
          />
        )}
      </div>
      <p
        className={[
          "px-2 py-2 text-center text-xs font-semibold",
          variant === "after" ? "text-violet-700" : "text-slate-600",
        ].join(" ")}
      >
        {label}
      </p>
    </div>
  );
}

function GripIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5 text-white"
      aria-hidden
    >
      <path strokeLinecap="round" d="M8 9v6M16 9v6" />
    </svg>
  );
}
