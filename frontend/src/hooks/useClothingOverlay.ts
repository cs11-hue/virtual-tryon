"use client";

import { useCallback, useEffect, useState } from "react";

import type { ClothingItem, ClothingOverlay } from "@/types/clothing";

export interface UseClothingOverlayReturn {
  overlay: ClothingOverlay | null;
  setOverlay: (overlay: ClothingOverlay) => void;
  resetOverlay: () => void;
}

export function useClothingOverlay(
  clothing: ClothingItem | null,
): UseClothingOverlayReturn {
  const [overlay, setOverlayState] = useState<ClothingOverlay | null>(null);

  useEffect(() => {
    if (!clothing) {
      setOverlayState(null);
      return;
    }
    setOverlayState({ ...clothing.overlay });
    // 옷을 바꿀 때만 위치를 초기화한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clothing.id
  }, [clothing?.id]);

  const setOverlay = useCallback((next: ClothingOverlay) => {
    setOverlayState(next);
  }, []);

  const resetOverlay = useCallback(() => {
    if (clothing) {
      setOverlayState({ ...clothing.overlay });
    }
  }, [clothing]);

  return { overlay, setOverlay, resetOverlay };
}
