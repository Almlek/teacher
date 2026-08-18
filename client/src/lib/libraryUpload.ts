export const supportedLibraryFileTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export function isSupportedLibraryType(fileType: string) {
  return supportedLibraryFileTypes.includes(fileType as (typeof supportedLibraryFileTypes)[number]);
}

export function getLibraryFileLabel(fileType?: string | null) {
  if (fileType === "application/pdf") return "PDF";
  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "Word DOCX";
  if (fileType === "image/jpeg") return "صورة JPG";
  if (fileType === "image/png") return "صورة PNG";
  if (fileType === "image/webp") return "صورة WEBP";
  if (fileType === "image/gif") return "صورة GIF";
  return "نوع غير معروف";
}
