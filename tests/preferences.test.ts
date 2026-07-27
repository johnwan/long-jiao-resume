import { describe, expect, it, vi } from "vitest";
import {
  getReducedMotionPreference,
  supportsWebGL,
} from "../src/components/EmulatorPanel";

describe("device scene preferences", () => {
  it("detects reduced-motion preferences", () => {
    vi.mocked(window.matchMedia).mockImplementationOnce(
      () =>
        ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    expect(getReducedMotionPreference()).toBe(true);
  });

  it("falls back when WebGL cannot be created", () => {
    expect(supportsWebGL()).toBe(false);
  });
});
