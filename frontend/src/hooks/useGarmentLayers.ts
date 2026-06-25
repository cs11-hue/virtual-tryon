"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getDefaultGarmentTransform } from "@/lib/layer-layout";
import { normalizeLayer, patchLayer } from "@/lib/layer-bounds";
import type { ClothingItem } from "@/types/clothing";
import type { GarmentLayerEntry, GarmentLayerState } from "@/types/garment-layer";
import type { LayerTransform } from "@/types/layer";

export interface UseGarmentLayersReturn {
  layers: GarmentLayerState[];
  setTransform: (clothingId: string, transform: LayerTransform) => void;
  resetTransform: (clothingId: string) => void;
  resetAll: () => void;
}

function buildDefaultTransform(
  item: ClothingItem,
  photoTransform: LayerTransform,
  photoAspect: number,
  aspect: number,
  index: number,
): LayerTransform {
  const base = getDefaultGarmentTransform(
    photoTransform,
    photoAspect,
    item.overlay,
    aspect,
  );
  return normalizeLayer(
    patchLayer(base, {
      leftPercent: base.leftPercent + index * 4,
      topPercent: base.topPercent + index * 2,
    }),
  );
}

export function useGarmentLayers(
  selectedItems: ClothingItem[],
  photoTransform: LayerTransform | null,
  photoAspect: number,
): UseGarmentLayersReturn {
  const [layerMap, setLayerMap] = useState<Record<string, GarmentLayerEntry>>(
    {},
  );

  const selectedKey = selectedItems.map((item) => item.id).join("|");

  useEffect(() => {
    if (!photoTransform) {
      setLayerMap({});
      return;
    }

    setLayerMap((prev) => {
      const next: Record<string, GarmentLayerEntry> = {};

      selectedItems.forEach((item, index) => {
        if (prev[item.id]) {
          next[item.id] = prev[item.id];
          return;
        }

        next[item.id] = {
          transform: buildDefaultTransform(
            item,
            photoTransform,
            photoAspect,
            0.75,
            index,
          ),
          aspect: 0.75,
        };
      });

      return next;
    });
  }, [selectedKey, photoTransform, photoAspect, selectedItems]);

  useEffect(() => {
    selectedItems.forEach((item) => {
      const image = new Image();
      const sync = () => {
        if (image.naturalWidth <= 0) return;
        const aspect = image.naturalWidth / image.naturalHeight;
        setLayerMap((prev) => {
          const current = prev[item.id];
          if (!current) return prev;
          return {
            ...prev,
            [item.id]: { ...current, aspect },
          };
        });
      };
      image.onload = sync;
      image.src = item.imageUrl;
      if (image.complete) sync();
    });
  }, [selectedKey, selectedItems]);

  const layers = useMemo<GarmentLayerState[]>(
    () =>
      selectedItems
        .filter((item) => layerMap[item.id])
        .map((item) => ({
          clothing: item,
          transform: layerMap[item.id].transform,
          aspect: layerMap[item.id].aspect,
        })),
    [layerMap, selectedItems],
  );

  const setTransform = useCallback(
    (clothingId: string, transform: LayerTransform) => {
      setLayerMap((prev) => {
        const current = prev[clothingId];
        if (!current) return prev;
        return {
          ...prev,
          [clothingId]: {
            ...current,
            transform: normalizeLayer(transform),
          },
        };
      });
    },
    [],
  );

  const resetTransform = useCallback(
    (clothingId: string) => {
      if (!photoTransform) return;
      const item = selectedItems.find((entry) => entry.id === clothingId);
      if (!item) return;
      const index = selectedItems.findIndex((entry) => entry.id === clothingId);
      const aspect = layerMap[clothingId]?.aspect ?? 0.75;

      setLayerMap((prev) => ({
        ...prev,
        [clothingId]: {
          aspect,
          transform: buildDefaultTransform(
            item,
            photoTransform,
            photoAspect,
            aspect,
            index,
          ),
        },
      }));
    },
    [layerMap, photoAspect, photoTransform, selectedItems],
  );

  const resetAll = useCallback(() => {
    if (!photoTransform) return;
    setLayerMap((prev) => {
      const next: Record<string, GarmentLayerEntry> = {};
      selectedItems.forEach((item, index) => {
        const aspect = prev[item.id]?.aspect ?? 0.75;
        next[item.id] = {
          aspect,
          transform: buildDefaultTransform(
            item,
            photoTransform,
            photoAspect,
            aspect,
            index,
          ),
        };
      });
      return next;
    });
  }, [photoAspect, photoTransform, selectedItems]);

  return { layers, setTransform, resetTransform, resetAll };
}
