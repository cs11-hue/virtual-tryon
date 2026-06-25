"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ClothingPicker } from "@/components/ClothingPicker";
import { PhotoDropzone } from "@/components/PhotoDropzone";
import { StylingProgress } from "@/components/StylingProgress";
import { StylingResult } from "@/components/StylingResult";
import {
  PhotoPreviewFrame,
  TryOnPreview,
} from "@/components/TryOnPreview";
import { getStepLabel, useMockStyling } from "@/hooks/useMockStyling";
import { useClothingOverlay } from "@/hooks/useClothingOverlay";
import { useCustomClothing } from "@/hooks/useCustomClothing";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { useTryOnComposite } from "@/hooks/useTryOnComposite";
import { mergeClothingCatalog, resolveClothingById } from "@/lib/resolve-clothing";
import { normalizeOverlay } from "@/lib/overlay-bounds";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/validate-image-file";
import type { ClothingItem, ClothingOverlay } from "@/types/clothing";

function getPanelTitle(phase: ReturnType<typeof useMockStyling>["phase"]): string {
  switch (phase) {
    case "loading":
      return "옷 입히는 중";
    case "result":
      return "피팅 결과";
    default:
      return "전신 사진 & 옷 선택";
  }
}

function getPanelDescription(
  phase: ReturnType<typeof useMockStyling>["phase"],
): string {
  switch (phase) {
    case "loading":
      return "AI가 체형에 맞게 옷을 조정하고 있습니다.";
    case "result":
      return "슬라이더로 원본과 피팅 결과를 비교해 보세요.";
    default:
      return "옷을 고른 뒤 미리보기에서 드래그로 옮기고, 더블클릭으로 크기를 바꿔 보세요.";
  }
}

export function UploadPanel() {
  const {
    previewUrl,
    error,
    isDragging,
    file,
    inputRef,
    setDragging,
    handleFile,
    clearPhoto,
    openFilePicker,
  } = usePhotoUpload();

  const { phase, progress, startStyling, resetStyling } = useMockStyling();
  const { customItems, addCustomClothing, removeCustomClothing } =
    useCustomClothing();

  const [selectedClothingId, setSelectedClothingId] = useState<string | null>(
    null,
  );
  const fittingPreviewRef = useRef<HTMLDivElement>(null);

  const clothingItems = useMemo(
    () => mergeClothingCatalog(customItems),
    [customItems],
  );

  const selectedClothing = useMemo(
    () =>
      selectedClothingId
        ? resolveClothingById(selectedClothingId, customItems) ?? null
        : null,
    [selectedClothingId, customItems],
  );

  const { overlay, setOverlay, resetOverlay } =
    useClothingOverlay(selectedClothing);

  const handleOverlayChange = (next: ClothingOverlay) => {
    setOverlay(normalizeOverlay(next));
  };

  const compositeActive = phase === "loading" || phase === "result";

  const { compositedUrl } = useTryOnComposite(
    previewUrl,
    selectedClothing,
    overlay,
    compositeActive,
  );

  const canSubmit =
    Boolean(file) &&
    Boolean(selectedClothing) &&
    Boolean(overlay) &&
    !error &&
    phase === "idle";

  const handleSelectClothing = (item: ClothingItem) => {
    setSelectedClothingId(item.id);
  };

  useEffect(() => {
    if (!previewUrl || !selectedClothingId || phase !== "idle") return;
    fittingPreviewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [previewUrl, selectedClothingId, phase]);

  const handleStartStyling = () => {
    if (!canSubmit) return;
    startStyling();
  };

  const handleRetry = () => {
    resetStyling();
  };

  const handleClearPhoto = () => {
    clearPhoto();
    setSelectedClothingId(null);
  };

  const handleRemoveCustom = (id: string) => {
    removeCustomClothing(id);
    if (selectedClothingId === id) {
      setSelectedClothingId(null);
    }
  };

  const handleCustomAdded = (item: ClothingItem) => {
    setSelectedClothingId(item.id);
  };

  const panelWidthClass =
    phase === "result"
      ? "max-w-3xl"
      : previewUrl && selectedClothing
        ? "max-w-2xl"
        : "max-w-lg";

  return (
    <section
      aria-labelledby="upload-panel-title"
      className={`w-full ${panelWidthClass} rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-violet-900/5 backdrop-blur-md sm:p-8`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        aria-hidden
        tabIndex={-1}
      />

      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
          {getStepLabel(phase)}
        </p>
        <h2
          id="upload-panel-title"
          className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl"
        >
          {getPanelTitle(phase)}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {getPanelDescription(phase)}
        </p>
      </header>

      {phase === "loading" && (
        <StylingProgress
          progress={progress}
          previewUrl={previewUrl}
          clothing={selectedClothing}
          overlay={overlay}
          compositedUrl={compositedUrl}
        />
      )}

      {phase === "result" && previewUrl && selectedClothing && (
        <StylingResult
          originalUrl={previewUrl}
          afterUrl={compositedUrl ?? previewUrl}
          clothing={selectedClothing}
          onRetry={handleRetry}
        />
      )}

      {phase === "idle" && (
        <div className="space-y-6">
          {!previewUrl ? (
            <PhotoDropzone
              previewUrl={previewUrl}
              error={error}
              isDragging={isDragging}
              onFileSelect={handleFile}
              onDragStateChange={setDragging}
              onOpenPicker={openFilePicker}
              onClear={handleClearPhoto}
            />
          ) : selectedClothing && overlay ? (
            <div ref={fittingPreviewRef} className="space-y-4">
              <TryOnPreview
                photoUrl={previewUrl}
                clothing={selectedClothing}
                overlay={overlay}
                onOverlayChange={handleOverlayChange}
                compositedUrl={null}
                interactive
              />
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={resetOverlay}
                  className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
                >
                  옷 위치 초기화
                </button>
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-300"
                >
                  다른 사진
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClothingId(null)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-300"
                >
                  옷 다시 고르기
                </button>
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600"
                >
                  사진 삭제
                </button>
              </div>
            </div>
          ) : (
            <PhotoPreviewFrame
              photoUrl={previewUrl}
              onChangePhoto={openFilePicker}
              onClearPhoto={handleClearPhoto}
            />
          )}

          <ClothingPicker
            items={clothingItems}
            selectedId={selectedClothingId}
            onSelect={handleSelectClothing}
            onAddCustom={addCustomClothing}
            onCustomAdded={handleCustomAdded}
            onRemoveCustom={handleRemoveCustom}
            disabled={!previewUrl}
          />

          <button
            type="button"
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            onClick={handleStartStyling}
            className={[
              "w-full rounded-xl py-3.5 text-sm font-semibold transition-all",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
              canSubmit
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-indigo-500"
                : "cursor-not-allowed bg-slate-200 text-slate-500",
            ].join(" ")}
          >
            {selectedClothing
              ? `「${selectedClothing.name}」 입히기`
              : "옷을 선택해 주세요"}
          </button>
        </div>
      )}
    </section>
  );
}
