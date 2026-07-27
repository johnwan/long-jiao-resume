import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

describe("Android Studio résumé experience", () => {
  it("starts in the unselected, powered-off state", () => {
    render(<App />);
    expect(screen.getByText("No file selected")).toBeInTheDocument();
    expect(screen.getByText("Waiting for file selection")).toBeInTheDocument();
    expect(
      screen.getByText(/Select a Kotlin file from the Project window/),
    ).toBeInTheDocument();
  });

  it("opens a Kotlin file, changes the hash, and powers on the profile", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("treeitem", { name: /ProfessionalSummary.kt/ }));

    expect(window.location.hash).toBe("#/summary");
    expect(screen.getByRole("tab", { name: /ProfessionalSummary.kt/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Profile running")).toBeInTheDocument();
    expect(screen.getByText("@Profile")).toBeInTheDocument();
  });

  it("switches files and returns to the off state after the last tab closes", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("treeitem", { name: /Skills.kt/ }));
    expect(screen.getByText("Skill map")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close Skills.kt" }));

    expect(window.location.hash).toBe("#/");
    expect(screen.getByText("Waiting for file selection")).toBeInTheDocument();
  });

  it("supports arrow-key navigation within the project tree", () => {
    render(<App />);
    const tree = screen.getByRole("tree", { name: "Long Jiao résumé project" });
    const items = within(tree).getAllByRole("treeitem");
    items[0].focus();
    fireEvent.keyDown(items[0], { key: "ArrowDown" });
    expect(items[1]).toHaveFocus();
  });

  it("collapses and expands project packages", () => {
    render(<App />);
    const skillsPackage = screen.getByRole("treeitem", {
      name: /^Skills$/,
    });
    expect(skillsPackage).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(skillsPackage);
    expect(skillsPackage).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("treeitem", { name: /^Skills\.kt$/ }),
    ).not.toBeInTheDocument();
  });

  it("labels the system-driven Islands theme", () => {
    render(<App />);
    expect(screen.getByText("Islands Dark")).toBeInTheDocument();
  });

  it("supports a local light-theme QA override without changing the default", () => {
    window.history.replaceState({}, "", "/?theme=light");
    render(<App />);
    expect(screen.getByText("Islands Light")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("changes the Islands theme from the Settings dialog", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(
      screen.getByRole("dialog", { name: "Appearance & Behavior" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Islands Light/ }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(screen.getByText("Islands Light")).toBeInTheDocument();
    expect(window.localStorage.getItem("resume-theme-preference")).toBe(
      "light",
    );
  });

  it("closes the Settings dialog with Escape", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("uses the static scene and hides a missing fallback asset when WebGL is unavailable", () => {
    render(<App />);
    expect(document.querySelector(".static-scene")).toBeInTheDocument();
    expect(document.querySelector(".laptop-screen-overlay")).not.toBeInTheDocument();
    expect(document.querySelector(".sticker-surface")).not.toBeInTheDocument();
    const fallbackImage = document.querySelector<HTMLImageElement>(
      ".static-scene img",
    );
    expect(fallbackImage).toBeInTheDocument();
    fireEvent.error(fallbackImage!);
    expect(fallbackImage).toHaveAttribute("hidden");
  });
});
