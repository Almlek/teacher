import { describe, expect, it } from "vitest";
import { getLibraryFileLabel, isSupportedLibraryType } from "./libraryUpload";

describe("library upload UI helpers", () => {
  it("labels supported PDF and image types", () => {
    expect(getLibraryFileLabel("application/pdf")).toBe("PDF");
    expect(getLibraryFileLabel("image/png")).toBe("صورة PNG");
  });

  it("rejects unsupported browser file types", () => {
    expect(isSupportedLibraryType("application/pdf")).toBe(true);
    expect(isSupportedLibraryType("text/plain")).toBe(false);
    expect(getLibraryFileLabel("text/plain")).toBe("نوع غير معروف");
  });
});
