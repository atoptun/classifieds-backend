import { describe, it, expect } from "vitest";

describe("Vitest environment", () => {
  it("use test DATABASE_URL", () => {
    expect(process.env.DATABASE_URL).toContain("classifieds_test");
  });
});
