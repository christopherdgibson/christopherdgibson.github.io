import { viewCallbacks } from './viewCallbacks.js';

export type ViewKey = "home" | "experience" | "work" | "research" | "teaching" | "about" | "nyc-dashboard"| "report-download-hub" | "admin-doc-repo" | "react-native-tzcomp" | "wordpress-plugins" | "personal-site-page";
export type PreviewViewKey = "experience" | "work";

export interface ProjectType {
  id:string;
  viewName: ViewKey,
  callback?: () => void
}

export type ViewCallbackKey = keyof typeof viewCallbacks;

export type ViewCallbackProps = {
 home: ((containerSelector?: string) => void)[];
 work: ((containerSelector?: string) => void)[];
 about: ((containerSelector?: string) => void)[];
 "nyc-dashboard": ((containerSelector?: string) => void)[];
 "report-download-hub": (() => void)[];
 "admin-doc-repo": (() => void)[];
 "react-native-tzcomp": (() => void)[];
 "wordpress-plugins": (() => void)[];
 "personal-site-page": ((containerSelector?: string) => void)[];
}