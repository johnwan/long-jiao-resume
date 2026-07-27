import {
  CaretDown,
  CaretRight,
  Crosshair,
  DotsThreeVertical,
  FileCode,
  FolderSimple,
  Minus,
  Package,
  Plus,
} from "@phosphor-icons/react";
import { useMemo, useRef, useState } from "react";
import { resumeSections } from "../data/resume";
import type { ResumeRoute } from "../types";

interface ProjectTreeProps {
  activeId: ResumeRoute | null;
  onSelect: (id: ResumeRoute) => void;
}

export function ProjectTree({ activeId, onSelect }: ProjectTreeProps) {
  const treeRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    summary: true,
    skills: true,
    experience: true,
    education: true,
  });

  const visibleSections = useMemo(() => resumeSections, []);

  function toggleSection(id: string) {
    setExpanded((current) => ({ ...current, [id]: !current[id] }));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const tree = treeRef.current;
    if (!tree) return;
    const allItems = Array.from(
      tree.querySelectorAll<HTMLButtonElement>("[data-tree-item='true']"),
    );
    const visibleItems = allItems.filter((item) => item.offsetParent !== null);
    const items = visibleItems.length > 0 ? visibleItems : allItems;
    const currentIndex = items.indexOf(event.target as HTMLButtonElement);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = Math.min(items.length - 1, currentIndex + 1);
    if (event.key === "ArrowUp") nextIndex = Math.max(0, currentIndex - 1);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      items[nextIndex]?.focus();
      return;
    }

    const target = event.target as HTMLButtonElement;
    const sectionId = target.dataset.section;
    if (sectionId && event.key === "ArrowRight" && !expanded[sectionId]) {
      event.preventDefault();
      toggleSection(sectionId);
    }
    if (sectionId && event.key === "ArrowLeft" && expanded[sectionId]) {
      event.preventDefault();
      toggleSection(sectionId);
    }
  }

  return (
    <aside className="project-tool-window" aria-label="Project">
      <div className="tool-window-title project-titlebar">
        <span className="project-view-label">
          Android
          <CaretDown size={12} />
        </span>
        <span className="project-title-actions" aria-hidden="true">
          <Plus size={17} />
          <Crosshair size={17} />
          <DotsThreeVertical size={18} weight="bold" />
          <Minus size={17} />
        </span>
      </div>
      <div
        ref={treeRef}
        className="project-tree"
        role="tree"
        aria-label="Long Jiao résumé project"
        onKeyDown={handleKeyDown}
      >
        <div className="project-root is-selected">
          <CaretDown size={13} weight="bold" aria-hidden="true" />
          <Package size={16} weight="fill" aria-hidden="true" />
          <span>long-jiao-resume</span>
          <span className="project-root-path">C:\Portfolio\resume</span>
        </div>
        {visibleSections.map((section) => (
          <div className="tree-section" key={section.id} role="group">
            <button
              type="button"
              role="treeitem"
              aria-expanded={expanded[section.id]}
              className="tree-row tree-folder"
              data-tree-item="true"
              data-section={section.id}
              onClick={() => toggleSection(section.id)}
            >
              {expanded[section.id] ? (
                <CaretDown size={13} weight="bold" aria-hidden="true" />
              ) : (
                <CaretRight size={13} weight="bold" aria-hidden="true" />
              )}
              <FolderSimple size={16} weight="fill" aria-hidden="true" />
              <span>{section.label}</span>
            </button>
            {expanded[section.id] && (
              <div className="tree-files" role="group">
                {section.files.map((file) => (
                  <button
                    type="button"
                    role="treeitem"
                    aria-selected={activeId === file.id}
                    className={`tree-row tree-file ${
                      activeId === file.id ? "is-selected" : ""
                    }`}
                    data-tree-item="true"
                    key={file.id}
                    onClick={() => onSelect(file.id)}
                  >
                    <span className="tree-spacer" aria-hidden="true" />
                    <FileCode
                      size={15}
                      weight={activeId === file.id ? "fill" : "regular"}
                      aria-hidden="true"
                    />
                    <span>{file.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
