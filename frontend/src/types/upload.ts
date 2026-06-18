import type { OutfitStyleKey } from "@/constants/outfit-styles";

export interface PhotoUploadState {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  isDragging: boolean;
}

export interface UploadFormState {
  photo: PhotoUploadState;
  styleKey: OutfitStyleKey;
}
