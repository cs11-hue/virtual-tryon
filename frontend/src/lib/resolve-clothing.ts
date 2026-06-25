import {
  CLOTHING_CATALOG,
  getClothingById,
} from "@/constants/clothing-catalog";
import type { ClothingItem } from "@/types/clothing";

export function resolveClothingById(
  id: string,
  customItems: readonly ClothingItem[],
): ClothingItem | undefined {
  return customItems.find((item) => item.id === id) ?? getClothingById(id);
}

export function mergeClothingCatalog(
  customItems: readonly ClothingItem[],
): ClothingItem[] {
  return [...customItems, ...CLOTHING_CATALOG];
}
