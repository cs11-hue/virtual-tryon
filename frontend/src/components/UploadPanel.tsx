"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ClothingPicker } from "@/components/ClothingPicker";
import { PhotoDropzone } from "@/components/PhotoDropzone";
import { StylingProgress } from "@/components/StylingProgress";
import { StylingResult } from "@/components/StylingResult";
import { TryOnPreview } from "@/components/TryOnPreview";
import { getStepLabel, useMockStyling } from "@/hooks/useMockStyling";
import { useCustomClothing } from "@/hooks/useCustomClothing";
import { useGarmentLayers } from "@/hooks/useGarmentLayers";
import { usePhotoTransform } from "@/hooks/usePhotoTransform";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { useTryOnComposite } from "@/hooks/useTryOnComposite";
import { mergeClothingCatalog, resolveClothingById } from "@/lib/resolve-clothing";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/validate-image-file";
import type { ClothingItem } from "@/types/clothing";

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
      return "옷을 여러 벌 선택해 드래그로 맞추고, 더블클릭해 크기(%)를 입력하세요.";
  }
}

function getSubmitLabel(items: ClothingItem[]): string {
  if (items.length === 0) return "옷을 선택해 주세요";
  if (items.length === 1) return `「${items[0].name}」 입히기`;
  return `${items.length}벌 입히기`;
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

  const [selectedClothingIds, setSelectedClothingIds] = useState<string[]>([]);
  const fittingPreviewRef = useRef<HTMLDivElement>(null);

  const {
    transform: photoTransform,
    photoAspect,
    setTransform: setPhotoTransform,
    resetTransform: resetPhotoTransform,
  } = usePhotoTransform(previewUrl);

  const clothingItems = useMemo(
    () => mergeClothingCatalog(customItems),
    [customItems],
  );

  const selectedClothingItems = useMemo(
    () =>
      selectedClothingIds
        .map((id) => resolveClothingById(id, customItems))
        .filter((item): item is ClothingItem => Boolean(item)),
    [selectedClothingIds, customItems],
  );

  const { layers: garmentLayers, setTransform: setGarmentTransform, resetAll: resetGarmentTransforms } =
    useGarmentLayers(selectedClothingItems, photoTransform, photoAspect);

  const compositeActive = phase === "loading" || phase === "result";

  const { compositedUrl } = useTryOnComposite(
    previewUrl,
    garmentLayers,
    photoTransform,
    compositeActive,
  );

  const canSubmit =
    Boolean(file) &&
    selectedClothingItems.length > 0 &&
    garmentLayers.length > 0 &&
    Boolean(photoTransform) &&
    !error &&
    phase === "idle";

  const handleToggleClothing = (item: ClothingItem) => {
    setSelectedClothingIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id],
    );
  };

  useEffect(() => {
    if (!previewUrl || phase !== "idle") return;
    fittingPreviewRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [previewUrl, selectedClothingIds.length, phase]);

  const handleStartStyling = () => {
    if (!canSubmit) return;
    startStyling();
  };

  const handleRetry = () => {
    resetStyling();
  };

  const handleClearPhoto = () => {
    clearPhoto();
    setSelectedClothingIds([]);
  };

  const handleRemoveCustom = (id: string) => {
    removeCustomClothing(id);
    setSelectedClothingIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const handleCustomAdded = (item: ClothingItem) => {
    setSelectedClothingIds((prev) =>
      prev.includes(item.id) ? prev : [...prev, item.id],
    );
  };

  const panelWidthClass =
    phase === "result"
      ? "max-w-3xl"
      : previewUrl
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
          photoTransform={photoTransform}
          photoAspect={photoAspect}
          garmentLayers={garmentLayers}
          compositedUrl={compositedUrl}
        />
      )}

      {phase === "result" && previewUrl && selectedClothingItems.length > 0 && (
        <StylingResult
          originalUrl={previewUrl}
          afterUrl={compositedUrl ?? previewUrl}
          clothingItems={selectedClothingItems}
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
          ) : (
            photoTransform && (
              <div ref={fittingPreviewRef} className="space-y-4">
                <TryOnPreview
                  photoUrl={previewUrl}
                  photoTransform={photoTransform}
                  onPhotoTransformChange={setPhotoTransform}
                  photoAspect={photoAspect}
                  garmentLayers={garmentLayers}
                  onGarmentTransformChange={setGarmentTransform}
                  compositedUrl={null}
                  interactive
                />
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={resetPhotoTransform}
                    className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
                  >
                    사진 위치 초기화
                  </button>
                  {garmentLayers.length > 0 && (
                    <button
                      type="button"
                      onClick={resetGarmentTransforms}
                      className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
                    >
                      옷 위치 초기화
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-300"
                  >
                    다른 사진
                  </button>
                  {selectedClothingItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedClothingIds([])}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-300"
                    >
                      옷 선택 해제
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600"
                  >
                    사진 삭제
                  </button>
                </div>
              </div>
            )
          )}

          <ClothingPicker
            items={clothingItems}
            selectedIds={selectedClothingIds}
            onToggle={handleToggleClothing}
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
            {getSubmitLabel(selectedClothingItems)}
          </button>
        </div>
      )}
    </section>
  );
}
