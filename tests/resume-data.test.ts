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
    expect(stickers).toHaveLength(13);
    expect(new Set(stickers.map((sticker) => sticker.id)).size).toBe(13);
    expect(stickers.every((sticker) => sticker.image.endsWith(".png"))).toBe(
      true,
    );
  });
});
