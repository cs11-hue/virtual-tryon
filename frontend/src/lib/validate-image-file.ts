export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_EXTENSIONS = ".jpg, .jpeg, .png, .webp";

const ACCEPTED_FILE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const MAX_FILE_SIZE_LABEL = "10MB";

function hasAcceptedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ACCEPTED_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function isAcceptedImageFile(file: File): boolean {
  if (
    ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return true;
  }

  return hasAcceptedExtension(file.name);
}

export function validateImageFile(file: File): string | null {
  if (!isAcceptedImageFile(file)) {
    return "JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `파일 크기는 ${MAX_FILE_SIZE_LABEL} 이하여야 합니다.`;
  }

  return null;
}
