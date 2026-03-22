import { describe, it, expect } from "vitest";
import { isFuzzyDuplicate } from "../similarity-matcher";

describe("isFuzzyDuplicate", () => {
  it("detects same vendor + amount + same date", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Acme", amount: 500, date: "2025-01-15" }
      )
    ).toBe(true);
  });

  it("detects same vendor + amount + date within 1 day", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Acme", amount: 500, date: "2025-01-16" }
      )
    ).toBe(true);
  });

  it("rejects different vendor", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Other Corp", amount: 500, date: "2025-01-15" }
      )
    ).toBe(false);
  });

  it("rejects different amount", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Acme", amount: 600, date: "2025-01-15" }
      )
    ).toBe(false);
  });

  it("rejects dates more than 1 day apart", () => {
    expect(
      isFuzzyDuplicate(
        { vendor: "Acme", amount: 500, date: "2025-01-15" },
        { vendor: "Acme", amount: 500, date: "2025-01-20" }
      )
    ).toBe(false);
  });
});
