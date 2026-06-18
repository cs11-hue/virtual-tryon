export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_EXTENSIONS = ".jpg, .jpeg, .png, .webp";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const MAX_FILE_SIZE_LABEL = "10MB";

export function validateImageFile(file: File): string | null {
  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return "JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `파일 크기는 ${MAX_FILE_SIZE_LABEL} 이하여야 합니다.`;
  }

  return null;
}
