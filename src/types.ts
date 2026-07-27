export type ResumeRoute =
  | "summary"
  | "skills"
  | "experience/meta"
  | "experience/freewheel"
  | "experience/ipos"
  | "education/uwm"
  | "education/zhengzhou";

export type SceneState = "none" | ResumeRoute;

export type ResumeFileKind = "summary" | "skills" | "experience" | "education";

export interface Experience {
  company: string;
  role: string;
  period: string;
  achievements: string[];
}

export interface Education {
  school: string;
  degree: string;
  period?: string;
  location: string;
}

export interface ResumeFile {
  id: ResumeRoute;
  name: string;
  packageName: string;
  kind: ResumeFileKind;
  summary?: string;
  skills?: string[];
  experience?: Experience;
  education?: Education;
  stickerId?: string;
}

export interface ResumeSection {
  id: string;
  label: string;
  packageName: string;
  files: ResumeFile[];
}

export interface StickerDescriptor {
  id: string;
  label: string;
  image: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
}
