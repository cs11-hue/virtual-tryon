"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CLOTHING_CATEGORY_LABELS } from "@/constants/clothing-catalog";
import { DEFAULT_STYLE_KEY } from "@/constants/outfit-styles";
import { getDefaultOverlay } from "@/lib/default-clothing-overlay";
import { validateImageFile } from "@/lib/validate-image-file";
import type { ClothingCategory, ClothingItem } from "@/types/clothing";

export interface AddCustomClothingInput {
  file: File;
  name: string;
  category: ClothingCategory;
}

export interface UseCustomClothingReturn {
  customItems: ClothingItem[];
  addCustomClothing: (input: AddCustomClothingInput) => ClothingItem | string;
  removeCustomClothing: (id: string) => void;
}

function createCustomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useCustomClothing(): UseCustomClothingReturn {
  const [customItems, setCustomItems] = useState<ClothingItem[]>([]);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const trackBlobUrl = useCallback((url: string) => {
    blobUrlsRef.current.add(url);
  }, []);

  const revokeBlobUrl = useCallback((url: string) => {
    if (blobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  }, []);

  const addCustomClothing = useCallback(
    ({ file, name, category }: AddCustomClothingInput): ClothingItem | string => {
      const validationError = validateImageFile(file);
      if (validationError) return validationError;

      const trimmedName = name.trim() || `내 옷 ${customItems.length + 1}`;

      const imageUrl = URL.createObjectURL(file);
      trackBlobUrl(imageUrl);

      const item: ClothingItem = {
        id: createCustomId(),
        name: trimmedName,
        category,
        categoryLabel: CLOTHING_CATEGORY_LABELS[category],
        imageUrl,
        overlay: getDefaultOverlay(category),
        styleKey: DEFAULT_STYLE_KEY,
        isCustom: true,
      };

      setCustomItems((prev) => [item, ...prev]);
      return item;
    },
    [customItems.length, trackBlobUrl],
  );

  const removeCustomClothing = useCallback(
    (id: string) => {
      setCustomItems((prev) => {
        const target = prev.find((item) => item.id === id);
        if (target) revokeBlobUrl(target.imageUrl);
        return prev.filter((item) => item.id !== id);
      });
    },
    [revokeBlobUrl],
  );

  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  return { customItems, addCustomClothing, removeCustomClothing };
}
