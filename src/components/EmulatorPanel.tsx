import {
  AndroidLogo,
  ArrowClockwise,
  DeviceMobile,
  Power,
} from "@phosphor-icons/react";
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { resumeFiles } from "../data/resume";
import type { ResumeRoute, SceneState } from "../types";

const LaptopScene = lazy(() =>
  import("./LaptopScene").then((module) => ({ default: module.LaptopScene })),
);

class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("3D scene unavailable; using the static fallback.", error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(getReducedMotionPreference);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

function StaticSceneFallback({ sceneState }: { sceneState: SceneState }) {
  const isClosed = sceneState !== "none" && sceneState !== "summary";
  return (
    <div className={`static-scene ${isClosed ? "is-closed" : ""}`}>
      <Power
        className="static-fallback-icon"
        size={34}
        weight="duotone"
        aria-hidden="true"
      />
      <img
        src={
          isClosed
            ? "./assets/models/laptop-closed-fallback.webp"
            : "./assets/models/laptop-open-fallback.webp"
        }
        alt={
          isClosed
            ? "Closed laptop static fallback"
            : "Open laptop with a powered-off display static fallback"
        }
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
    </div>
  );
}

export function EmulatorPanel({ sceneState }: { sceneState: SceneState }) {
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(supportsWebGL);
  const [isVisible, setIsVisible] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const selectedFile =
    sceneState !== "none" ? resumeFiles[sceneState as ResumeRoute] : null;
  const isSummary = sceneState === "summary";
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const sceneLabel =
    sceneState === "none"
      ? "Waiting for file selection"
      : sceneState === "summary"
        ? "Profile running"
        : sceneState === "skills"
          ? "Skill map"
          : `Focused on ${selectedFile?.experience?.company ?? selectedFile?.education?.school}`;

  return (
    <aside
      ref={panelRef}
      className="device-tool-window"
      aria-label="Running Android Emulator"
    >
      <div className="tool-window-title device-title">
        <span>Running Devices</span>
        <span className="device-status">
          <span className="status-dot" />
          Pixel 10 API 36
        </span>
      </div>
      <div className="emulator-wrap">
        <div className="emulator-toolbar" aria-label="Emulator controls">
          <button type="button" aria-label="Power">
            <Power size={14} />
          </button>
          <button type="button" aria-label="Rotate device">
            <ArrowClockwise size={14} />
          </button>
          <span className="emulator-device-label">
            <DeviceMobile size={14} weight="fill" />
            resume-preview
          </span>
        </div>
        <div className="emulator-device">
          <div className="emulator-speaker" aria-hidden="true" />
          <div className="emulator-screen" data-testid="emulator-screen">
            <div className="android-status">
              <span>10:24</span>
              <AndroidLogo size={14} weight="fill" aria-hidden="true" />
              <span>5G · 100%</span>
            </div>
            <div className="scene-shell">
              {webgl ? (
                <SceneErrorBoundary fallback={<StaticSceneFallback sceneState={sceneState} />}>
                  <>
                    <div
                      className={`scene-underlay ${
                        sceneReady ? "is-hidden" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <StaticSceneFallback sceneState={sceneState} />
                    </div>
                    <Suspense fallback={null}>
                      <LaptopScene
                        sceneState={sceneState}
                        reducedMotion={reducedMotion}
                        active={isVisible}
                        onReady={handleSceneReady}
                      />
                    </Suspense>
                  </>
                </SceneErrorBoundary>
              ) : (
                <StaticSceneFallback sceneState={sceneState} />
              )}

            </div>
            <div className="scene-caption">
              <span className="scene-caption-dot" />
              <span>{sceneLabel}</span>
            </div>
            <div className="android-nav" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
