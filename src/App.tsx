import {
  AndroidLogo,
  Bell,
  Bug,
  CaretDown,
  DeviceMobile,
  DotsThreeVertical,
  EnvelopeSimple,
  FolderSimple,
  Gear,
  GitBranch,
  LinkedinLogo,
  List,
  MagnifyingGlass,
  Monitor,
  Moon,
  Play,
  SlidersHorizontal,
  SquaresFour,
  Sun,
  TerminalWindow,
  TreeStructure,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "./components/Editor";
import { EmulatorPanel } from "./components/EmulatorPanel";
import { ProjectTree } from "./components/ProjectTree";
import { resumeFiles } from "./data/resume";
import { applyRoute, parseHash } from "./lib/routing";
import type { ResumeRoute, SceneState } from "./types";

type ThemePreference = "system" | "dark" | "light";

const THEME_PREFERENCE_KEY = "resume-theme-preference";

function getInitialThemePreference(): ThemePreference {
  const requestedTheme = new URLSearchParams(window.location.search).get(
    "theme",
  );
  if (requestedTheme === "dark" || requestedTheme === "light") {
    return requestedTheme;
  }
  try {
    const savedTheme = window.localStorage.getItem(THEME_PREFERENCE_KEY);
    if (
      savedTheme === "system" ||
      savedTheme === "dark" ||
      savedTheme === "light"
    ) {
      return savedTheme;
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
  return "system";
}

function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>(
    getInitialThemePreference,
  );
  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  const resolvedTheme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    try {
      window.localStorage.setItem(THEME_PREFERENCE_KEY, preference);
    } catch {
      // The active theme still works for this session without persistence.
    }
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [preference, resolvedTheme]);

  return {
    preference,
    resolvedTheme,
    setPreference,
    themeName:
      resolvedTheme === "dark" ? "Islands Dark" : "Islands Light",
  } as const;
}

export function App() {
  const [sceneState, setSceneState] = useState<SceneState>(() =>
    parseHash(window.location.hash),
  );
  const [tabs, setTabs] = useState<ResumeRoute[]>(() => {
    const initial = parseHash(window.location.hash);
    return initial === "none" ? [] : [initial];
  });
  const [mobileProjectOpen, setMobileProjectOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftTheme, setDraftTheme] =
    useState<ThemePreference>("system");
  const settingsDialogRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const { preference, resolvedTheme, setPreference, themeName } =
    useThemePreference();

  useEffect(() => {
    const syncFromHash = () => {
      const route = parseHash(window.location.hash);
      setSceneState(route);
      if (route !== "none") {
        setTabs((current) =>
          current.includes(route) ? current : [...current, route],
        );
      }
    };
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSettings();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(
          settingsDialogRef.current?.querySelectorAll<HTMLElement>(
            'button, input, [href], [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => !element.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const focusFrame = window.requestAnimationFrame(() => {
      settingsDialogRef.current
        ?.querySelector<HTMLInputElement>(
          `input[name="theme-preference"][value="${draftTheme}"]`,
        )
        ?.focus();
    });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(focusFrame);
    };
  }, [draftTheme, settingsOpen]);

  const activeId = sceneState === "none" ? null : sceneState;
  const activeFile = activeId ? resumeFiles[activeId] : null;

  const subtitle = useMemo(() => {
    if (!activeFile) return "No file selected";
    if (activeFile.experience) {
      return `${activeFile.experience.company} · ${activeFile.experience.period}`;
    }
    if (activeFile.education) return activeFile.education.school;
    return activeFile.name;
  }, [activeFile]);

  function selectFile(id: ResumeRoute) {
    setTabs((current) => (current.includes(id) ? current : [...current, id]));
    setSceneState(id);
    applyRoute(id);
    setMobileProjectOpen(false);
  }

  function closeTab(id: ResumeRoute) {
    setTabs((current) => {
      const index = current.indexOf(id);
      const nextTabs = current.filter((tab) => tab !== id);
      if (sceneState === id) {
        const next = nextTabs[Math.min(index, nextTabs.length - 1)] ?? "none";
        setSceneState(next);
        applyRoute(next);
      }
      return nextTabs;
    });
  }

  function openSettings() {
    setDraftTheme(preference);
    setSettingsOpen(true);
  }

  function closeSettings() {
    setSettingsOpen(false);
    window.requestAnimationFrame(() => settingsButtonRef.current?.focus());
  }

  function applyThemePreference() {
    setPreference(draftTheme);
    closeSettings();
  }

  return (
    <div className="ide-shell">
      <header className="ide-toolbar">
        <div className="toolbar-cluster toolbar-leading">
          <span className="studio-mark" aria-hidden="true">
            <AndroidLogo size={21} weight="fill" />
          </span>
          <button
            type="button"
            className="toolbar-icon mobile-project-toggle"
            aria-label="Open project"
            aria-expanded={mobileProjectOpen}
            onClick={() => setMobileProjectOpen(true)}
          >
            <List size={21} />
          </button>
          <button type="button" className="toolbar-icon desktop-menu" aria-label="Main menu">
            <List size={22} />
          </button>
          <button type="button" className="project-switcher" aria-label="Current project">
            <span className="project-letter">R</span>
            <span>resume</span>
            <CaretDown size={13} />
          </button>
          <button type="button" className="version-control-control">
            <span>Version Control</span>
            <CaretDown size={13} />
          </button>
        </div>

        <div className="toolbar-cluster toolbar-run">
          <button type="button" className="run-selector">
            <DeviceMobile size={16} />
            <span>Pixel 10</span>
            <CaretDown size={12} />
          </button>
          <button type="button" className="run-selector">
            <AndroidLogo size={16} weight="fill" />
            <span>resume</span>
            <CaretDown size={12} />
          </button>
          <button type="button" className="toolbar-icon run-action" aria-label="Run résumé preview">
            <Play size={20} weight="regular" />
          </button>
          <button type="button" className="toolbar-icon debug-action" aria-label="Debug résumé preview">
            <Bug size={20} />
          </button>
          <button type="button" className="toolbar-icon" aria-label="More run actions">
            <DotsThreeVertical size={20} weight="bold" />
          </button>
        </div>

        <div className="toolbar-cluster toolbar-trailing">
          <span className="active-context" title={subtitle}>
            {subtitle}
          </span>
          <button type="button" className="toolbar-icon" aria-label="Search résumé">
            <MagnifyingGlass size={21} />
          </button>
          <button
            ref={settingsButtonRef}
            type="button"
            className="toolbar-icon"
            aria-label="Settings"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            onClick={openSettings}
          >
            <Gear size={21} />
          </button>
          <div className="profile-chip" title="Long Jiao">
            <img src="./assets/avatar/long-jiao-avatar.webp" alt="" />
          </div>
        </div>
      </header>

      <div className="ide-workspace">
        <nav className="ide-rail ide-rail-left" aria-label="Tool windows">
          <button type="button" className="rail-button is-active" aria-label="Project">
            <FolderSimple size={23} weight="fill" />
          </button>
          <button type="button" className="rail-button" aria-label="Structure">
            <TreeStructure size={22} />
          </button>
          <button type="button" className="rail-button" aria-label="Services">
            <SquaresFour size={21} />
          </button>
          <span className="rail-spacer" />
          <button type="button" className="rail-button" aria-label="Terminal">
            <TerminalWindow size={22} />
          </button>
          <button type="button" className="rail-button" aria-label="Version control">
            <GitBranch size={21} />
          </button>
        </nav>
        <div
          className={`mobile-project-backdrop ${
            mobileProjectOpen ? "is-visible" : ""
          }`}
          onClick={() => setMobileProjectOpen(false)}
          aria-hidden="true"
        />
        <div
          className={`project-panel-shell ${
            mobileProjectOpen ? "is-mobile-open" : ""
          }`}
        >
          <button
            type="button"
            className="mobile-project-close"
            aria-label="Close project"
            onClick={() => setMobileProjectOpen(false)}
          >
            <X size={16} weight="bold" />
          </button>
          <ProjectTree activeId={activeId} onSelect={selectFile} />
        </div>

        <Editor
          activeId={activeId}
          tabs={tabs}
          onActivate={selectFile}
          onClose={closeTab}
        />
        <EmulatorPanel sceneState={sceneState} />
        <nav className="ide-rail ide-rail-right" aria-label="Secondary tool windows">
          <button type="button" className="rail-button" aria-label="Notifications">
            <Bell size={22} />
          </button>
          <button type="button" className="rail-button is-active" aria-label="Running devices">
            <DeviceMobile size={22} />
          </button>
          <button type="button" className="rail-button" aria-label="Inspector">
            <SlidersHorizontal size={22} />
          </button>
          <span className="rail-spacer" />
          <a
            className="rail-button"
            href="mailto:jiaolong423@gmail.com"
            aria-label="Email Long Jiao"
          >
            <EnvelopeSimple size={21} />
          </a>
          <a
            className="rail-button"
            href="https://www.linkedin.com/in/jiaolong423/"
            target="_blank"
            rel="noreferrer"
            aria-label="Long Jiao on LinkedIn"
          >
            <LinkedinLogo size={21} weight="fill" />
          </a>
        </nav>
      </div>

      <footer className="ide-statusbar">
        <span className="status-segment">
          <GitBranch size={13} weight="bold" aria-hidden="true" />
          local-preview
        </span>
        <span>Syosset, NY</span>
        <span className="status-spacer" />
        <span>{themeName}</span>
        <a
          href="https://poly.pizza/m/WSDGZOHmVr"
          target="_blank"
          rel="noreferrer"
        >
          3D asset credits
        </a>
        <span>UTF-8</span>
        <span>Kotlin</span>
      </footer>

      {settingsOpen ? (
        <div
          className="settings-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSettings();
            }
          }}
        >
          <div
            ref={settingsDialogRef}
            className="settings-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appearance-settings-title"
          >
            <div className="settings-dialog-header">
              <div>
                <span className="settings-eyebrow">Settings</span>
                <h2 id="appearance-settings-title">Appearance &amp; Behavior</h2>
              </div>
              <button
                type="button"
                className="dialog-icon-button"
                aria-label="Close settings"
                onClick={closeSettings}
              >
                <X size={17} weight="bold" />
              </button>
            </div>

            <fieldset className="theme-fieldset">
              <legend>Theme</legend>
              <p>
                Choose an Islands theme or continue following your system
                appearance.
              </p>
              <div className="theme-option-list">
                <label
                  className={`theme-option ${
                    draftTheme === "system" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="theme-preference"
                    value="system"
                    checked={draftTheme === "system"}
                    onChange={() => setDraftTheme("system")}
                  />
                  <Monitor size={24} />
                  <span>
                    <strong>System</strong>
                    <small>
                      Currently{" "}
                      {resolvedTheme === "dark" ? "dark" : "light"}
                    </small>
                  </span>
                </label>
                <label
                  className={`theme-option ${
                    draftTheme === "dark" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="theme-preference"
                    value="dark"
                    checked={draftTheme === "dark"}
                    onChange={() => setDraftTheme("dark")}
                  />
                  <Moon size={24} />
                  <span>
                    <strong>Islands Dark</strong>
                    <small>Dark editor and tool windows</small>
                  </span>
                </label>
                <label
                  className={`theme-option ${
                    draftTheme === "light" ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="theme-preference"
                    value="light"
                    checked={draftTheme === "light"}
                    onChange={() => setDraftTheme("light")}
                  />
                  <Sun size={24} />
                  <span>
                    <strong>Islands Light</strong>
                    <small>Light editor and tool windows</small>
                  </span>
                </label>
              </div>
            </fieldset>

            <div className="settings-dialog-footer">
              <button
                type="button"
                className="dialog-button"
                onClick={closeSettings}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dialog-button is-primary"
                onClick={applyThemePreference}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
