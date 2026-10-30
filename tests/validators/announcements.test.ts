import { describe, it, expect } from "vitest";
import { CreateAnnouncementSchema } from "@/validators/announcements.validator.ts";
import {
  invalidAnnouncement,
  validAnnouncement,
} from "../data/announcements.ts";

describe("CreateAnnouncementSchema", () => {
  it("uses valid data", () => {
    const result = CreateAnnouncementSchema.safeParse(validAnnouncement);

    expect(result.success).toBe(true);
  });

  it("rejects invalid data", () => {
    const result = CreateAnnouncementSchema.safeParse(invalidAnnouncement);

    expect(result.success).toBe(false);
  });
});
