"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ImageNaturalSize {
  width: number;
  height: number;
}

export function useImageNaturalSize(url: string | null) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState<ImageNaturalSize | null>(null);

  const readNaturalSize = useCallback((img: HTMLImageElement) => {
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  }, []);

  useEffect(() => {
    setNaturalSize(null);
    const img = imgRef.current;
    if (!img) return;

    const sync = () => readNaturalSize(img);

    if (img.complete) {
      sync();
      return;
    }

    img.addEventListener("load", sync);
    return () => img.removeEventListener("load", sync);
  }, [url, readNaturalSize]);

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      readNaturalSize(event.currentTarget);
    },
    [readNaturalSize],
  );

  return { imgRef, naturalSize, handleLoad };
}
