import { describe, expect, it } from "vitest";
import { decodeAndValidateLibraryFile, MAX_LIBRARY_FILE_SIZE } from "./libraryUpload";

describe("library upload validation", () => {
  it("accepts a PDF with a valid signature", () => {
    const data = decodeAndValidateLibraryFile(Buffer.from("%PDF-1.7 lesson").toString("base64"), "application/pdf");
    expect(data.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("accepts a PNG with a valid signature", () => {
    const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(decodeAndValidateLibraryFile(pngHeader.toString("base64"), "image/png")).toEqual(pngHeader);
  });

  it("rejects unsupported types and mismatched content", () => {
    expect(() => decodeAndValidateLibraryFile("dGVzdA==", "text/plain")).toThrow("نوع الملف غير مدعوم");
    expect(() => decodeAndValidateLibraryFile(Buffer.from("not-a-pdf").toString("base64"), "application/pdf")).toThrow("لا يطابق نوعه");
  });

  it("rejects files larger than the configured limit", () => {
    const oversized = Buffer.alloc(MAX_LIBRARY_FILE_SIZE + 1, 0);
    expect(() => decodeAndValidateLibraryFile(oversized.toString("base64"), "application/pdf")).toThrow("10 ميجابايت");
  });
});
