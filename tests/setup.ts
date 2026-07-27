import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

const storageValues = new Map<string, string>();
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => storageValues.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storageValues.set(key, String(value));
    },
    removeItem: (key: string) => {
      storageValues.delete(key);
    },
    clear: () => storageValues.clear(),
    key: (index: number) => [...storageValues.keys()][index] ?? null,
    get length() {
      return storageValues.size;
    },
  } satisfies Storage,
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
  window.localStorage.clear();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("dark"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
