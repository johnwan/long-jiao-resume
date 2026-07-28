import { describe, expect, it } from "vitest";
import {
  professionalSummary,
  resumeFiles,
  resumeSections,
  stickers,
  technicalSkills,
} from "../src/data/resume";

describe("résumé source data", () => {
  it("preserves the PDF section and file hierarchy", () => {
    expect(resumeSections.map((section) => section.label)).toEqual([
      "Professional Summary",
      "Skills",
      "Professional Experience",
      "Education",
    ]);
    expect(Object.keys(resumeFiles)).toHaveLength(7);
  });

  it("preserves the exact skill and achievement counts", () => {
    expect(technicalSkills).toHaveLength(13);
    expect(resumeFiles["experience/meta"].experience?.achievements).toHaveLength(
      14,
    );
    expect(
      resumeFiles["experience/freewheel"].experience?.achievements,
    ).toHaveLength(3);
    expect(resumeFiles["experience/ipos"].experience?.achievements).toHaveLength(
      5,
    );
  });

  it("keeps the public résumé identity and education facts", () => {
    expect(professionalSummary).toContain("over 13 years");
    expect(resumeFiles["education/uwm"].education).toEqual({
      school: "University of Wisconsin-Milwaukee",
      degree: "Master of Science (MS), Electronics and Computer Engineering",
      period: "2011 - 2014",
      location: "Milwaukee, WI",
    });
    expect(resumeFiles["education/zhengzhou"].education?.period).toBeUndefined();
  });

  it("maps all skill, employer, and school sticker assets", () => {
    expect(stickers).toHaveLength(21);
    expect(new Set(stickers.map((sticker) => sticker.id)).size).toBe(21);
    expect(stickers.every((sticker) => sticker.image.endsWith(".png"))).toBe(
      true,
    );
    expect(stickers.map((sticker) => sticker.id)).toEqual(
      expect.arrayContaining([
        "android-logo",
        "graphql-logo",
        "facebook-logo",
        "instagram-logo",
        "whatsapp-logo",
        "threads-logo",
        "claude-logo",
        "codex-logo",
      ]),
    );
  });

  it("keeps the complete sticker grid inside the A-shell safe area", () => {
    for (const sticker of stickers) {
      expect(sticker.x).toBeGreaterThanOrEqual(5);
      expect(sticker.y).toBeGreaterThanOrEqual(5);
      expect(sticker.x + sticker.width).toBeLessThanOrEqual(95);
      expect(sticker.y + sticker.width).toBeLessThanOrEqual(95);
    }

    for (let index = 0; index < stickers.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < stickers.length; otherIndex += 1) {
        const sticker = stickers[index];
        const other = stickers[otherIndex];
        const overlaps =
          sticker.x < other.x + other.width &&
          sticker.x + sticker.width > other.x &&
          sticker.y < other.y + other.width &&
          sticker.y + sticker.width > other.y;
        expect(overlaps).toBe(false);
      }
    }
  });
});
