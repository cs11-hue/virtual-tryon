import type { ClothingItem } from "@/types/clothing";
import type { LayerTransform } from "@/types/layer";

export interface GarmentLayerEntry {
  transform: LayerTransform;
  aspect: number;
}

export interface GarmentLayerState {
  clothing: ClothingItem;
  transform: LayerTransform;
  aspect: number;
}
