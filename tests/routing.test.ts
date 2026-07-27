import { describe, expect, it } from "vitest";
import { parseHash, routeToHash, routeToScene } from "../src/lib/routing";

describe("resume routing", () => {
  it("parses every public résumé route", () => {
    expect(parseHash("#/summary")).toBe("summary");
    expect(parseHash("#/skills/")).toBe("skills");
    expect(parseHash("#/experience/meta")).toBe("experience/meta");
    expect(parseHash("#/education/uwm")).toBe("education/uwm");
  });

  it("falls back to the powered-off scene for unknown hashes", () => {
    expect(parseHash("")).toBe("none");
    expect(parseHash("#/unknown")).toBe("none");
    expect(routeToScene("none")).toBe("none");
  });

  it("serializes scene state as shareable hash routes", () => {
    expect(routeToHash("none")).toBe("#/");
    expect(routeToHash("experience/freewheel")).toBe(
      "#/experience/freewheel",
    );
  });
});
