"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { LayerSizePrompt } from "@/components/LayerSizePrompt";
import { layerToPixelRect, pixelRectToLayer } from "@/lib/layer-layout";
import { normalizeLayer, patchLayer } from "@/lib/layer-bounds";
import type { LayoutRect } from "@/lib/object-contain-layout";
import type { LayerTransform } from "@/types/layer";

const DRAG_THRESHOLD_PX = 4;

function getClientPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
  return { x: event.clientX, y: event.clientY };
}

export interface DraggableLayerProps {
  imageUrl: string;
  alt: string;
  transform: LayerTransform;
  onTransformChange: (transform: LayerTransform) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  aspect: number;
  zIndex: number;
  borderClassName: string;
  label: string;
  isActive?: boolean;
}

export function DraggableLayer({
  imageUrl,
  alt,
  transform,
  onTransformChange,
  containerRef,
  aspect,
  zIndex,
  borderClassName,
  label,
  isActive = true,
}: DraggableLayerProps) {
  const [imageAspect, setImageAspect] = useState(aspect);
  const [layoutTick, setLayoutTick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sizePromptOpen, setSizePromptOpen] = useState(false);
  const transformRef = useRef(transform);
  const didDragRef = useRef(false);
  transformRef.current = transform;

  useLayoutEffect(() => {
    setLayoutTick((n) => n + 1);
  }, []);

  useEffect(() => {
    setImageAspect(aspect);
  }, [aspect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => setLayoutTick((n) => n + 1));
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  const getContainerRect = useCallback((): LayoutRect | null => {
    const container = containerRef.current;
    if (!container) return null;

    void layoutTick;

    return {
      x: 0,
      y: 0,
      width: container.clientWidth,
      height: container.clientHeight,
    };
  }, [containerRef, layoutTick]);

  const commitPixelRect = useCallback(
    (pixelRect: LayoutRect) => {
      const container = getContainerRect();
      if (!container || container.width <= 0 || container.height <= 0) return;

      const next = pixelRectToLayer(container, pixelRect);
      onTransformChange(
        normalizeLayer({
          ...transformRef.current,
          ...next,
        }),
      );
    },
    [getContainerRect, onTransformChange],
  );

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!isActive) return;

      const container = getContainerRect();
      if (!container) return;

      const startRect = layerToPixelRect(
        container,
        transformRef.current,
        imageAspect,
      );
      const startPointer = { x: clientX, y: clientY };
      didDragRef.current = false;

      const onMove = (event: MouseEvent | TouchEvent) => {
        if ("touches" in event) event.preventDefault();

        const point = getClientPoint(event);
        const dx = point.x - startPointer.x;
        const dy = point.y - startPointer.y;

        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

        didDragRef.current = true;
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
    [commitPixelRect, getContainerRect, imageAspect, isActive],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isActive || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      startDrag(event.clientX, event.clientY);
    },
    [isActive, startDrag],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isActive || event.touches.length !== 1) return;
      event.stopPropagation();
      const touch = event.touches[0];
      startDrag(touch.clientX, touch.clientY);
    },
    [isActive, startDrag],
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isActive) return;
      event.preventDefault();
      event.stopPropagation();
      if (didDragRef.current) return;
      setSizePromptOpen(true);
    },
    [isActive],
  );

  const handleApplySize = useCallback(
    (widthPercent: number) => {
      onTransformChange(
        patchLayer(transformRef.current, { widthPercent }),
      );
    },
    [onTransformChange],
  );

  const container = getContainerRect();
  if (!container || container.width <= 0) return null;

  const pixelRect = layerToPixelRect(container, transform, imageAspect);

  return (
    <>
      <div
        role="img"
        aria-label={`${label} — 드래그로 이동, 더블클릭으로 크기 입력`}
        className={[
          "absolute touch-none select-none",
          isActive
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-default opacity-80",
        ].join(" ")}
        style={{
          left: pixelRect.x,
          top: pixelRect.y,
          width: pixelRect.width,
          height: pixelRect.height,
          opacity: transform.opacity ?? 1,
          zIndex,
          pointerEvents: isActive ? "auto" : "none",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className={[
            "relative h-full w-full rounded border-2 border-dashed shadow-md",
            borderClassName,
            isActive ? "ring-2 ring-offset-1 ring-offset-white/80" : "",
            isActive ? "ring-slate-400/80" : "",
          ].join(" ")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            draggable={false}
            className="pointer-events-none h-full w-full object-contain"
            onLoad={(event) => {
              const img = event.currentTarget;
              if (img.naturalWidth > 0) {
                setImageAspect(img.naturalWidth / img.naturalHeight);
              }
            }}
          />
          <span className="pointer-events-none absolute left-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white">
            {label}
            {isActive ? " · 선택됨" : ""}
          </span>
        </div>
      </div>

      <LayerSizePrompt
        open={sizePromptOpen}
        label={label}
        widthPercent={transform.widthPercent}
        onApply={handleApplySize}
        onClose={() => setSizePromptOpen(false)}
      />
    </>
  );
}

export function StaticLayer({
  imageUrl,
  transform,
  containerRef,
  aspect,
  zIndex,
  opacity,
}: {
  imageUrl: string;
  transform: LayerTransform;
  containerRef: React.RefObject<HTMLDivElement | null>;
  aspect: number;
  zIndex: number;
  opacity?: number;
}) {
  const [imageAspect, setImageAspect] = useState(aspect);
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

  const containerRect: LayoutRect = {
    x: 0,
    y: 0,
    width: container.clientWidth,
    height: container.clientHeight,
  };
  const pixelRect = layerToPixelRect(containerRect, transform, imageAspect);

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: pixelRect.x,
        top: pixelRect.y,
        width: pixelRect.width,
        height: pixelRect.height,
        opacity: opacity ?? transform.opacity ?? 1,
        zIndex,
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        className="h-full w-full object-contain"
        onLoad={(event) => {
          const img = event.currentTarget;
          if (img.naturalWidth > 0) {
            setImageAspect(img.naturalWidth / img.naturalHeight);
          }
        }}
      />
    </div>
  );
}
