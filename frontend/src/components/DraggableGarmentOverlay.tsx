"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  getObjectContainRect,
  overlayToPixelRect,
  pixelRectToOverlay,
  type LayoutRect,
} from "@/lib/object-contain-layout";
import { normalizeOverlay, patchOverlay } from "@/lib/overlay-bounds";
import type { ClothingItem, ClothingOverlay } from "@/types/clothing";

const DRAG_THRESHOLD_PX = 4;
const SIZE_STEPS = [30, 45, 60, 80, 100, 130] as const;

function getClientPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
  return { x: event.clientX, y: event.clientY };
}

export interface DraggableGarmentOverlayProps {
  clothing: ClothingItem;
  overlay: ClothingOverlay;
  onOverlayChange: (overlay: ClothingOverlay) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  photoNaturalSize: { width: number; height: number };
}

export function DraggableGarmentOverlay({
  clothing,
  overlay,
  onOverlayChange,
  containerRef,
  photoNaturalSize,
}: DraggableGarmentOverlayProps) {
  const [garmentAspect, setGarmentAspect] = useState(0.75);
  const [layoutTick, setLayoutTick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeHint, setSizeHint] = useState<string | null>(null);
  const overlayRef = useRef(overlay);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  overlayRef.current = overlay;

  useLayoutEffect(() => {
    setLayoutTick((n) => n + 1);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => setLayoutTick((n) => n + 1));
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  const getImageRect = useCallback((): LayoutRect | null => {
    const container = containerRef.current;
    if (!container) return null;

    void layoutTick;

    return getObjectContainRect(
      container.clientWidth,
      container.clientHeight,
      photoNaturalSize.width,
      photoNaturalSize.height,
    );
  }, [containerRef, photoNaturalSize, layoutTick]);

  const commitPixelRect = useCallback(
    (pixelRect: LayoutRect) => {
      const imageRect = getImageRect();
      if (!imageRect || imageRect.width <= 0 || imageRect.height <= 0) return;

      const next = pixelRectToOverlay(imageRect, pixelRect);
      onOverlayChange(
        normalizeOverlay({
          ...overlayRef.current,
          topPercent: next.topPercent,
          leftPercent: next.leftPercent,
          widthPercent: next.widthPercent,
        }),
      );
    },
    [getImageRect, onOverlayChange],
  );

  const showSizeHint = useCallback((widthPercent: number) => {
    const index = SIZE_STEPS.findIndex((step) => step === widthPercent);
    const label =
      index <= 0 ? "작게" : index >= SIZE_STEPS.length - 1 ? "아주 크게" : "크기 조절됨";
    setSizeHint(label);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setSizeHint(null), 1200);
  }, []);

  const cycleSize = useCallback(() => {
    const current = overlayRef.current.widthPercent;
    const next =
      SIZE_STEPS.find((step) => step > current + 2) ?? SIZE_STEPS[0];
    onOverlayChange(patchOverlay(overlayRef.current, { widthPercent: next }));
    showSizeHint(next);
  }, [onOverlayChange, showSizeHint]);

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      const imageRect = getImageRect();
      if (!imageRect) return;

      const startRect = overlayToPixelRect(
        imageRect,
        overlayRef.current,
        garmentAspect,
      );
      const startPointer = { x: clientX, y: clientY };
      let moved = false;

      const onMove = (event: MouseEvent | TouchEvent) => {
        if ("touches" in event) event.preventDefault();

        const point = getClientPoint(event);
        const dx = point.x - startPointer.x;
        const dy = point.y - startPointer.y;

        if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        moved = true;

        commitPixelRect({
          ...startRect,
          x: startRect.x + dx,
          y: startRect.y + dy,
        });
      };

      const onEnd = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onEnd);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onEnd);
        setIsDragging(false);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onEnd);
      setIsDragging(true);
    },
    [commitPixelRect, garmentAspect, getImageRect],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      startDrag(event.clientX, event.clientY);
    },
    [startDrag],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.touches.length !== 1) return;
      event.stopPropagation();
      const touch = event.touches[0];
      startDrag(touch.clientX, touch.clientY);
    },
    [startDrag],
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      cycleSize();
    },
    [cycleSize],
  );

  const imageRect = getImageRect();
  if (!imageRect || imageRect.width <= 0) return null;

  const pixelRect = overlayToPixelRect(imageRect, overlay, garmentAspect);

  return (
    <div
      className="absolute inset-0 z-20"
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <div
        role="img"
        aria-label={`${clothing.name} — 드래그로 이동, 더블클릭으로 크기 조절`}
        className={[
          "absolute touch-none select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        ].join(" ")}
        style={{
          left: pixelRect.x,
          top: pixelRect.y,
          width: pixelRect.width,
          height: pixelRect.height,
          opacity: overlay.opacity ?? 0.92,
          pointerEvents: "auto",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
      >
        <div className="relative h-full w-full rounded border-2 border-dashed border-violet-500 bg-violet-400/15 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={clothing.imageUrl}
            alt={clothing.name}
            draggable={false}
            className="pointer-events-none h-full w-full object-contain"
            onLoad={(event) => {
              const img = event.currentTarget;
              if (img.naturalWidth > 0) {
                setGarmentAspect(img.naturalWidth / img.naturalHeight);
              }
            }}
          />
          {sizeHint && (
            <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-violet-600 px-2 py-1 text-xs font-semibold text-white shadow">
              {sizeHint}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function StaticGarmentOverlay({
  clothing,
  overlay,
  containerRef,
  photoNaturalSize,
}: DraggableGarmentOverlayProps) {
  const [garmentAspect, setGarmentAspect] = useState(0.75);
  const [layoutTick, setLayoutTick] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => setLayoutTick((n) => n + 1));
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  const container = containerRef.current;
  if (!container) return null;

  void layoutTick;

  const imageRect = getObjectContainRect(
    container.clientWidth,
    container.clientHeight,
    photoNaturalSize.width,
    photoNaturalSize.height,
  );
  const pixelRect = overlayToPixelRect(imageRect, overlay, garmentAspect);

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left: pixelRect.x,
        top: pixelRect.y,
        width: pixelRect.width,
        height: pixelRect.height,
        opacity: overlay.opacity ?? 0.9,
      }}
      aria-hidden
    >
      <Image
        src={clothing.imageUrl}
        alt=""
        width={400}
        height={500}
        className="h-full w-full object-contain drop-shadow-lg"
        unoptimized={
          clothing.imageUrl.startsWith("blob:") ||
          clothing.imageUrl.startsWith("data:")
        }
        onLoad={(event) => {
          const img = event.currentTarget;
          if (img.naturalWidth > 0) {
            setGarmentAspect(img.naturalWidth / img.naturalHeight);
          }
        }}
      />
    </div>
  );
}
