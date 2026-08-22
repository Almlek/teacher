import { describe, expect, it } from "vitest";
import config from "./capacitor.config";

describe("إعداد تطبيق المعلم الذكي لأندرويد", () => {
  it("يستخدم هوية Android والرابط المنشور عبر HTTPS", () => {
    expect(config.appId).toBe("com.ailessonexams.smartteacher");
    expect(config.appName).toBe("المعلم الذكي");
    expect(config.webDir).toBe("dist/public");
    expect(config.server?.url).toBe("https://smartplan-ppvujobi.manus.space");
    expect(config.server?.cleartext).toBe(false);
  });
});
