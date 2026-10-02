import { describe, expect, it } from "vitest";
import { fromInputDate, toInputDate } from "@/lib/format";
import { getApiUrl } from "@/lib/api/client";

describe("format helpers", () => {
  it("converts ISO dates to input values", () => {
    expect(toInputDate("2026-03-15T12:00:00.000Z")).toBe("2026-03-15");
    expect(toInputDate("not-a-date")).toBe("");
  });

  it("builds ISO ranges from input dates", () => {
    expect(fromInputDate("2026-03-15")).toBe("2026-03-15T00:00:00.000Z");
    expect(fromInputDate("2026-03-15", true)).toBe("2026-03-15T23:59:59.999Z");
    expect(fromInputDate("")).toBe("");
  });
});

describe("api client", () => {
  it("exposes a default API base URL", () => {
    expect(getApiUrl()).toMatch(/^https?:\/\//);
  });
});
