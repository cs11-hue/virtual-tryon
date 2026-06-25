"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getDefaultGarmentTransform } from "@/lib/layer-layout";
import { normalizeLayer } from "@/lib/layer-bounds";
import type { ClothingItem } from "@/types/clothing";
import type { LayerTransform } from "@/types/layer";

export interface UseClothingOverlayReturn {
  overlay: LayerTransform | null;
  garmentAspect: number;
  setOverlay: (overlay: LayerTransform) => void;
  resetOverlay: () => void;
}

export function useClothingOverlay(
  clothing: ClothingItem | null,
  photoTransform: LayerTransform | null,
  photoAspect: number,
): UseClothingOverlayReturn {
  const [overlay, setOverlayState] = useState<LayerTransform | null>(null);
  const [garmentAspect, setGarmentAspect] = useState(0.75);
  const lastClothingIdRef = useRef<string | null>(null);

  const buildDefault = useCallback((): LayerTransform | null => {
    if (!clothing || !photoTransform) return null;
    return normalizeLayer(
      getDefaultGarmentTransform(
        photoTransform,
        photoAspect,
        clothing.overlay,
        garmentAspect,
      ),
    );
  }, [clothing, garmentAspect, photoAspect, photoTransform]);

  useEffect(() => {
    if (!clothing) {
      setGarmentAspect(0.75);
      setOverlayState(null);
      lastClothingIdRef.current = null;
      return;
    }

    const image = new Image();
    const sync = () => {
      if (image.naturalWidth > 0) {
        setGarmentAspect(image.naturalWidth / image.naturalHeight);
      }
    };
    image.onload = sync;
    image.src = clothing.imageUrl;
    if (image.complete) sync();

    return () => {
      image.onload = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clothing.id
  }, [clothing?.id, clothing?.imageUrl]);

  useEffect(() => {
    if (!clothing || !photoTransform) {
      if (!clothing) setOverlayState(null);
      return;
    }

    const isNewClothing = lastClothingIdRef.current !== clothing.id;
    if (isNewClothing) {
      lastClothingIdRef.current = clothing.id;
      setOverlayState(buildDefault());
      return;
    }

    setOverlayState((prev) => prev ?? buildDefault());
  }, [clothing, photoTransform, buildDefault]);

  const setOverlay = useCallback((next: LayerTransform) => {
    setOverlayState(normalizeLayer(next));
  }, []);

  const resetOverlay = useCallback(() => {
    const next = buildDefault();
    if (next) setOverlayState(next);
  }, [buildDefault]);

  return { overlay, garmentAspect, setOverlay, resetOverlay };
}
