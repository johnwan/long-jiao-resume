import { FileCode, X } from "@phosphor-icons/react";
import { Fragment, type ReactNode } from "react";
import { resumeFiles } from "../data/resume";
import type { ResumeRoute } from "../types";

interface EditorProps {
  activeId: ResumeRoute | null;
  tabs: ResumeRoute[];
  onActivate: (id: ResumeRoute) => void;
  onClose: (id: ResumeRoute) => void;
}

function CodeLine({
  number,
  children,
  muted = false,
}: {
  number: number;
  children?: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className={`code-line ${muted ? "is-muted" : ""}`}>
      <span className="line-number" aria-hidden="true">
        {number}
      </span>
      <span className="code-content">{children}</span>
    </div>
  );
}

const keyword = (text: string) => <span className="syntax-keyword">{text}</span>;
const type = (text: string) => <span className="syntax-type">{text}</span>;
const property = (text: string) => <span className="syntax-property">{text}</span>;
const string = (text: string) => <span className="syntax-string">"{text}"</span>;
const punctuation = (text: string) => (
  <span className="syntax-punctuation">{text}</span>
);
const tabDomId = (id: ResumeRoute) =>
  `tab-${id.replace(/[^a-z0-9]/gi, "-")}`;

function KotlinDocument({ id }: { id: ResumeRoute }) {
  const file = resumeFiles[id];
  let line = 1;

  if (file.kind === "summary" && file.summary) {
    const sentences = file.summary.match(/[^.!?]+[.!?]+/g) ?? [file.summary];
    return (
      <article className="code-document" aria-label="Professional Summary Kotlin file">
        <CodeLine number={line++}>
          {keyword("package")} {file.packageName}
        </CodeLine>
        <CodeLine number={line++} />
        <CodeLine number={line++}>
          <span className="syntax-annotation">@Profile</span>
        </CodeLine>
        <CodeLine number={line++}>
          {keyword("data object")} {type("ProfessionalSummary")} {punctuation("{")}
        </CodeLine>
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("headline")} = {string("Staff Android Engineer")}
        </CodeLine>
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("location")} = {string("Syosset, NY")}
        </CodeLine>
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("overview")} = {punctuation('"""')}
        </CodeLine>
        {sentences.map((sentence) => (
          <CodeLine number={line++} key={sentence}>
            <span className="syntax-multiline">{"        "}{sentence.trim()}</span>
          </CodeLine>
        ))}
        <CodeLine number={line++}>
          {"    "}
          {punctuation('""".trimIndent()')}
        </CodeLine>
        <CodeLine number={line++}>{punctuation("}")}</CodeLine>
      </article>
    );
  }

  if (file.kind === "skills" && file.skills) {
    return (
      <article className="code-document" aria-label="Technical skills Kotlin file">
        <CodeLine number={line++}>
          {keyword("package")} {file.packageName}
        </CodeLine>
        <CodeLine number={line++} />
        <CodeLine number={line++}>
          <span className="syntax-comment">
            {"// Tools I use to build reliable mobile systems"}
          </span>
        </CodeLine>
        <CodeLine number={line++}>
          {keyword("val")} {property("technicalSkills")} = {type("setOf")}
          {punctuation("(")}
        </CodeLine>
        {file.skills.map((skill, index) => (
          <CodeLine number={line++} key={skill}>
            {"    "}
            {string(skill)}
            {index < file.skills!.length - 1 ? punctuation(",") : null}
          </CodeLine>
        ))}
        <CodeLine number={line++}>{punctuation(")")}</CodeLine>
      </article>
    );
  }

  if (file.kind === "experience" && file.experience) {
    const experience = file.experience;
    const objectName = file.name.replace(".kt", "").replace(/[^a-zA-Z]/g, "");
    return (
      <article className="code-document" aria-label={`${experience.company} experience Kotlin file`}>
        <CodeLine number={line++}>
          {keyword("package")} {file.packageName}
        </CodeLine>
        <CodeLine number={line++} />
        <CodeLine number={line++}>
          <span className="syntax-annotation">@Experience</span>
        </CodeLine>
        <CodeLine number={line++}>
          {keyword("data object")} {type(objectName)} {punctuation("{")}
        </CodeLine>
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("company")} = {string(experience.company)}
        </CodeLine>
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("role")} = {string(experience.role)}
        </CodeLine>
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("period")} = {string(experience.period)}
        </CodeLine>
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("impact")} = {type("listOf")}
          {punctuation("(")}
        </CodeLine>
        {experience.achievements.map((achievement, index) => (
          <Fragment key={achievement}>
            <CodeLine number={line++}>
              <span className="achievement-prefix">{"        • "}</span>
              <span className="syntax-string achievement-text">
                "{achievement}"
              </span>
              {index < experience.achievements.length - 1
                ? punctuation(",")
                : null}
            </CodeLine>
          </Fragment>
        ))}
        <CodeLine number={line++}>
          {"    "}
          {punctuation(")")}
        </CodeLine>
        <CodeLine number={line++}>{punctuation("}")}</CodeLine>
      </article>
    );
  }

  if (file.kind === "education" && file.education) {
    const education = file.education;
    return (
      <article className="code-document" aria-label={`${education.school} education Kotlin file`}>
        <CodeLine number={line++}>
          {keyword("package")} {file.packageName}
        </CodeLine>
        <CodeLine number={line++} />
        <CodeLine number={line++}>
          <span className="syntax-annotation">@Education</span>
        </CodeLine>
        <CodeLine number={line++}>
          {keyword("data object")} {type(file.name.replace(".kt", ""))}{" "}
          {punctuation("{")}
        </CodeLine>
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("school")} = {string(education.school)}
        </CodeLine>
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("degree")} = {string(education.degree)}
        </CodeLine>
        {education.period && (
          <CodeLine number={line++}>
            {"    "}
            {keyword("val")} {property("period")} = {string(education.period)}
          </CodeLine>
        )}
        <CodeLine number={line++}>
          {"    "}
          {keyword("val")} {property("location")} = {string(education.location)}
        </CodeLine>
        <CodeLine number={line++}>{punctuation("}")}</CodeLine>
      </article>
    );
  }

  return null;
}

export function Editor({
  activeId,
  tabs,
  onActivate,
  onClose,
}: EditorProps) {
  const activeFile = activeId ? resumeFiles[activeId] : null;

  return (
    <main className="editor-window" aria-label="Résumé editor">
      <div className="editor-tabs" role="tablist" aria-label="Open résumé files">
        {tabs.map((id) => {
          const file = resumeFiles[id];
          const isActive = id === activeId;
          return (
            <div
              className={`editor-tab ${isActive ? "is-active" : ""}`}
              role="presentation"
              key={id}
            >
              <button
                id={tabDomId(id)}
                type="button"
                className="tab-main"
                role="tab"
                aria-selected={isActive}
                aria-controls="editor-document"
                tabIndex={isActive ? 0 : -1}
                onClick={() => onActivate(id)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                    return;
                  }
                  event.preventDefault();
                  const offset = event.key === "ArrowRight" ? 1 : -1;
                  const nextIndex = (tabs.indexOf(id) + offset + tabs.length) %
                    tabs.length;
                  const nextId = tabs[nextIndex];
                  onActivate(nextId);
                  document.getElementById(tabDomId(nextId))?.focus();
                }}
              >
                <FileCode size={14} weight="fill" aria-hidden="true" />
                <span>{file.name}</span>
              </button>
              <button
                type="button"
                className="tab-close"
                aria-label={`Close ${file.name}`}
                onClick={() => onClose(id)}
              >
                <X size={12} weight="bold" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      {activeFile ? (
        <>
          <div className="editor-breadcrumbs" aria-label="File path">
            <span>long-jiao-resume</span>
            <span>/</span>
            <span>{activeFile.packageName}</span>
            <span>/</span>
            <strong>{activeFile.name}</strong>
          </div>
          <div
            id="editor-document"
            className="editor-scroll"
            role="tabpanel"
            aria-labelledby={tabDomId(activeFile.id)}
          >
            <KotlinDocument id={activeFile.id} />
          </div>
        </>
      ) : (
        <div className="editor-empty">
          <div className="empty-avatar-frame">
            <img
              src="./assets/avatar/long-jiao-avatar.webp"
              alt="Long Jiao's 3D-style avatar"
            />
          </div>
          <span className="empty-kicker">LONG JIAO / RESUME.KT</span>
          <h1>Staff Android Engineer</h1>
          <p>
            Mobile infrastructure, product engineering, and client performance
            across 13+ years of Android development.
          </p>
          <div className="empty-hint">
            Select a Kotlin file from the Project window to inspect the résumé.
          </div>
        </div>
      )}
    </main>
  );
}
