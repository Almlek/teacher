import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./storage", () => ({ storagePut: vi.fn() }));
vi.mock("./db", () => ({
  createLessonPlan: vi.fn(),
  getLessonPlansByUserId: vi.fn(),
  getLessonPlanById: vi.fn(),
  updateLessonPlan: vi.fn(),
  deleteLessonPlan: vi.fn(),
  addLibraryBook: vi.fn(),
  getLibraryBooksByUserId: vi.fn(),
  deleteLibraryBook: vi.fn(),
  getUserSettings: vi.fn(),
  upsertUserSettings: vi.fn(),
}));
vi.mock("./lessonGenerator", () => ({ generateLessonPlan: vi.fn() }));

const { appRouter } = await import("./routers");
const { addLibraryBook, upsertUserSettings } = await import("./db");
const { storagePut } = await import("./storage");

function createCaller() {
  return appRouter.createCaller({
    user: { id: 22 } as any,
    req: {} as any,
    res: {} as any,
  });
}

describe("library.upload route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storagePut).mockResolvedValue({ key: "22-library/book_abc.pdf", url: "/manus-storage/22-library/book_abc.pdf" });
    vi.mocked(addLibraryBook).mockResolvedValue({ insertId: 17 } as any);
  });

  it("uploads a valid PDF and saves its storage metadata", async () => {
    const result = await createCaller().library.upload({
      title: "كتاب الرياضيات",
      fileName: "math-book.pdf",
      fileType: "application/pdf",
      fileData: Buffer.from("%PDF-1.7 lesson").toString("base64"),
      subject: "الرياضيات",
      grade: "الأول",
    });

    expect(result).toEqual({ insertId: 17 });
    expect(storagePut).toHaveBeenCalledWith(expect.stringContaining("22-library/"), expect.any(Buffer), "application/pdf");
    expect(addLibraryBook).toHaveBeenCalledWith(expect.objectContaining({
      userId: 22,
      title: "كتاب الرياضيات",
      fileUrl: "/manus-storage/22-library/book_abc.pdf",
      fileType: "application/pdf",
    }));
  });

  it("rejects unsupported files before contacting storage", async () => {
    await expect(createCaller().library.upload({
      title: "ملف غير مدعوم",
      fileName: "notes.txt",
      fileType: "text/plain",
      fileData: Buffer.from("notes").toString("base64"),
    })).rejects.toThrow("نوع الملف غير مدعوم");
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("surfaces storage failures without creating a database record", async () => {
    vi.mocked(storagePut).mockRejectedValueOnce(new Error("storage unavailable"));

    await expect(createCaller().library.upload({
      title: "كتاب العلوم",
      fileName: "science.pdf",
      fileType: "application/pdf",
      fileData: Buffer.from("%PDF-1.7 lesson").toString("base64"),
    })).rejects.toThrow("storage unavailable");
    expect(addLibraryBook).not.toHaveBeenCalled();
  });
});

describe("settings.logoUpload route", () => {
  it("uploads a valid PNG and saves the logo URL", async () => {
    vi.mocked(storagePut).mockResolvedValueOnce({ key: "22-school-branding/logo.png", url: "/manus-storage/22-school-branding/logo.png" });
    const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const result = await createCaller().settings.logoUpload({
      fileName: "school-logo.png",
      fileType: "image/png",
      fileData: pngHeader.toString("base64"),
    });
    expect(result.url).toBe("/manus-storage/22-school-branding/logo.png");
    expect(upsertUserSettings).toHaveBeenCalledWith(22, { schoolLogoUrl: result.url });
  });
});
