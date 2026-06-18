"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { validateImageFile } from "@/lib/validate-image-file";
import type { PhotoUploadState } from "@/types/upload";

const INITIAL_STATE: PhotoUploadState = {
  file: null,
  previewUrl: null,
  error: null,
  isDragging: false,
};

export interface UsePhotoUploadReturn extends PhotoUploadState {
  setDragging: (value: boolean) => void;
  handleFile: (file: File | null) => void;
  clearPhoto: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
}

export function usePhotoUpload(): UsePhotoUploadReturn {
  const [state, setState] = useState<PhotoUploadState>(INITIAL_STATE);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  }, []);

  const clearPhoto = useCallback(() => {
    revokePreview();
    setState(INITIAL_STATE);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [revokePreview]);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;

      const validationError = validateImageFile(file);
      if (validationError) {
        revokePreview();
        setState((prev) => ({
          ...prev,
          file: null,
          previewUrl: null,
          error: validationError,
          isDragging: false,
        }));
        return;
      }

      revokePreview();
      const previewUrl = URL.createObjectURL(file);
      previewRef.current = previewUrl;

      setState({
        file,
        previewUrl,
        error: null,
        isDragging: false,
      });
    },
    [revokePreview],
  );

  const setDragging = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, isDragging: value }));
  }, []);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    return () => revokePreview();
  }, [revokePreview]);

  return {
    ...state,
    setDragging,
    handleFile,
    clearPhoto,
    inputRef,
    openFilePicker,
  };
}
