import { viewCallbacks } from './viewCallbacks.js';

export const VIEW_KEYS = [
  'home', 'about', 'experience', 'research', 'teaching', 'work', 'articles', 'articles/building-a-router',
  "nyc-dashboard", "report-download-hub", "admin-doc-repo" , "react-native-tzcomp", "wordpress-plugins", "personal-site-page"
] as const;

export type ViewKey = typeof VIEW_KEYS[number];

export type PreviewViewKey = "experience" | "work";

export interface ProjectType {
  id:string;
  viewName: ViewKey,
  callback?: () => void
}

export interface CallbackProps {
  bodyElement?: HTMLElement;
  containerSelector?: string;
  isLoadCurrent?: () => boolean;
}

export type ViewCallback = (params: CallbackProps) => void | Promise<void>;

export type ViewCallbackKey = keyof typeof viewCallbacks;

export type ViewCallbackProps = {
 home: ViewCallback[];
 about: ViewCallback[];
 work: ViewCallback[];
 articles: ViewCallback[];
 "report-download-hub": ViewCallback[];
 "admin-doc-repo": ViewCallback[];
 "react-native-tzcomp": ViewCallback[];
 "wordpress-plugins": ViewCallback[];
 "personal-site-page": ViewCallback[];
 "articles/building-a-router": ViewCallback[];
}

export function isViewKey(value: string): value is ViewKey {
  return (VIEW_KEYS as readonly string[]).includes(value);
}
