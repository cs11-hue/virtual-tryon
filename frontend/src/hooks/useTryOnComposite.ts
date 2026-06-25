"use client";

import { useEffect, useRef, useState } from "react";

import { compositeTryOnImage } from "@/lib/composite-tryon-image";
import type { GarmentLayerState } from "@/types/garment-layer";
import type { LayerTransform } from "@/types/layer";

export interface UseTryOnCompositeReturn {
  compositedUrl: string | null;
  isCompositing: boolean;
  error: string | null;
}

export function useTryOnComposite(
  photoUrl: string | null,
  garmentLayers: GarmentLayerState[],
  photoTransform: LayerTransform | null,
  active: boolean,
): UseTryOnCompositeReturn {
  const [compositedUrl, setCompositedUrl] = useState<string | null>(null);
  const [isCompositing, setIsCompositing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const garmentKey = garmentLayers
    .map(
      (layer) =>
        `${layer.clothing.id}:${layer.transform.leftPercent},${layer.transform.topPercent},${layer.transform.widthPercent}`,
    )
    .join("|");

  useEffect(() => {
    if (
      !active ||
      !photoUrl ||
      !photoTransform ||
      garmentLayers.length === 0
    ) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setCompositedUrl(null);
      setError(null);
      setIsCompositing(false);
      return;
    }

    let cancelled = false;
    setIsCompositing(true);
    setError(null);

    compositeTryOnImage(
      photoUrl,
      photoTransform,
      garmentLayers.map((layer) => ({
        imageUrl: layer.clothing.imageUrl,
        transform: layer.transform,
      })),
    )
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = url;
        setCompositedUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setError("미리보기를 만들지 못했습니다.");
          setCompositedUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsCompositing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active, photoUrl, photoTransform, garmentKey, garmentLayers]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  return { compositedUrl, isCompositing, error };
}
