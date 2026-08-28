import { viewCallbacks } from './viewCallbacks.js';

const VIEW_KEYS_HOME = [
  'home'
] as const;

const VIEW_KEYS_ABOUT = [
  'about', 'experience', 'research', 'teaching',
] as const;

const VIEW_KEYS_WORK = [
  'work', "nyc-dashboard", "report-download-hub", "admin-doc-repo" , "react-native-tzcomp", "wordpress-plugins", "personal-site-page"
] as const;

const VIEW_KEYS_THOUGHTS = [
  'articles', 'articles/building-a-router', 'articles/router-lessons-two'
] as const;

const VIEW_KEYS_SECTIONS = {
  'about': VIEW_KEYS_ABOUT, 
  'work': VIEW_KEYS_WORK,
  'articles': VIEW_KEYS_THOUGHTS,
}

export const VIEW_KEYS = [...VIEW_KEYS_HOME, ...VIEW_KEYS_ABOUT, ...VIEW_KEYS_WORK, ...VIEW_KEYS_THOUGHTS] as const;

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
  loadSignal: AbortSignal; // may need to separate in case callbacks need container but not async
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

export function getNavbarSection(view: ViewKey): ViewKey | null {
  if (view === 'home') return null;
  let navbarSection: ViewKey | null;
  for (const section of ['about', 'work', 'articles'] as ViewKey[]) {
    const keys = VIEW_KEYS_SECTIONS[section];
    if (keys.includes(view)) {
      navbarSection = section;
      break;
    }
  }
  
  return navbarSection;
}
