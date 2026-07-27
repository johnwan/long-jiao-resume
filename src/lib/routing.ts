import type { ResumeRoute, SceneState } from "../types";

export const routeIds: ResumeRoute[] = [
  "summary",
  "skills",
  "experience/meta",
  "experience/freewheel",
  "experience/ipos",
  "education/uwm",
  "education/zhengzhou",
];

export function parseHash(hash: string): SceneState {
  const normalized = hash.replace(/^#\/?/, "").replace(/\/$/, "");
  return routeIds.includes(normalized as ResumeRoute)
    ? (normalized as ResumeRoute)
    : "none";
}

export function routeToHash(route: SceneState): string {
  return route === "none" ? "#/" : `#/${route}`;
}

export function routeToScene(route: SceneState): SceneState {
  return route;
}

export function applyRoute(route: SceneState): void {
  const next = routeToHash(route);
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}
