"use client";

import { useEffect, useRef, useState } from "react";

import { compositeTryOnImage } from "@/lib/composite-tryon-image";
import type { ClothingItem } from "@/types/clothing";
import type { LayerTransform } from "@/types/layer";

export interface UseTryOnCompositeReturn {
  compositedUrl: string | null;
  isCompositing: boolean;
  error: string | null;
}

export function useTryOnComposite(
  photoUrl: string | null,
  clothing: ClothingItem | null,
  photoTransform: LayerTransform | null,
  garmentTransform: LayerTransform | null,
  active: boolean,
): UseTryOnCompositeReturn {
  const [compositedUrl, setCompositedUrl] = useState<string | null>(null);
  const [isCompositing, setIsCompositing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !active ||
      !photoUrl ||
      !clothing ||
      !photoTransform ||
      !garmentTransform
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
      clothing.imageUrl,
      photoTransform,
      garmentTransform,
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
  }, [active, photoUrl, clothing, photoTransform, garmentTransform]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  return { compositedUrl, isCompositing, error };
}
