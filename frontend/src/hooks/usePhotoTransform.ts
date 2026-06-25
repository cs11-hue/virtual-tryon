"use client";

import { useCallback, useEffect, useState } from "react";

import { getDefaultPhotoTransform } from "@/lib/layer-layout";
import { normalizeLayer } from "@/lib/layer-bounds";
import type { LayerTransform } from "@/types/layer";

export interface UsePhotoTransformReturn {
  transform: LayerTransform | null;
  photoAspect: number;
  setTransform: (transform: LayerTransform) => void;
  resetTransform: () => void;
}

export function usePhotoTransform(
  photoUrl: string | null,
): UsePhotoTransformReturn {
  const [transform, setTransformState] = useState<LayerTransform | null>(null);
  const [photoAspect, setPhotoAspect] = useState(3 / 4);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!photoUrl) {
      setNaturalSize(null);
      setTransformState(null);
      return;
    }

    const image = new Image();
    const sync = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        setNaturalSize({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
        setPhotoAspect(image.naturalWidth / image.naturalHeight);
      }
    };

    image.onload = sync;
    image.src = photoUrl;
    if (image.complete) sync();

    return () => {
      image.onload = null;
    };
  }, [photoUrl]);

  useEffect(() => {
    if (!photoUrl || !naturalSize) {
      setTransformState(null);
      return;
    }
    setTransformState(
      normalizeLayer(
        getDefaultPhotoTransform(naturalSize.width, naturalSize.height),
      ),
    );
  }, [photoUrl, naturalSize]);

  const setTransform = useCallback((next: LayerTransform) => {
    setTransformState(normalizeLayer(next));
  }, []);

  const resetTransform = useCallback(() => {
    if (!naturalSize) return;
    setTransformState(
      normalizeLayer(
        getDefaultPhotoTransform(naturalSize.width, naturalSize.height),
      ),
    );
  }, [naturalSize]);

  return { transform, photoAspect, setTransform, resetTransform };
}
