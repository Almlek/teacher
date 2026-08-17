export const MAX_LIBRARY_FILE_SIZE = 10 * 1024 * 1024;

const allowedLibraryTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function hasValidFileSignature(data: Buffer, fileType: string) {
  if (fileType === "application/pdf") return data.subarray(0, 4).toString() === "%PDF";
  if (fileType === "image/jpeg") return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  if (fileType === "image/png") return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (fileType === "image/gif") return ["GIF87a", "GIF89a"].includes(data.subarray(0, 6).toString());
  if (fileType === "image/webp") return data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP";
  return false;
}

export function decodeAndValidateLibraryFile(fileData: string, fileType: string) {
  if (!allowedLibraryTypes.has(fileType)) {
    throw new Error("نوع الملف غير مدعوم. ارفع PDF أو صورة بصيغة JPG أو PNG أو WEBP أو GIF.");
  }

  const data = Buffer.from(fileData, "base64");
  if (!data.length || data.length > MAX_LIBRARY_FILE_SIZE) {
    throw new Error("حجم الملف يجب أن يكون أكبر من صفر وألا يتجاوز 10 ميجابايت.");
  }
  if (!hasValidFileSignature(data, fileType)) {
    throw new Error("محتوى الملف لا يطابق نوعه المعلن.");
  }
  return data;
}
