import { viewCallbacks } from './viewCallbacks.js';

export type SectionKey = 'about' | 'work' | 'articles';
export type PreviewViewKey = 'experience' | 'work';

const VIEW_KEYS_ABOUT = [
  'experience', 'research', 'teaching',
] as const;

const VIEW_KEYS_WORK = [
  'nyc-dashboard', 'report-download-hub', 'admin-doc-repo' , 'react-native-tzcomp', 'wordpress-plugins', 'personal-site-page'
] as const;

const VIEW_KEYS_THOUGHTS = [
  'articles/building-a-router', 'articles/router-lessons-two'
] as const;

export const VIEW_KEYS = ['home', 'about', ...VIEW_KEYS_ABOUT, 'work', ...VIEW_KEYS_WORK, 'articles', ...VIEW_KEYS_THOUGHTS] as const;

export type ViewKey = typeof VIEW_KEYS[number];

const SECTION_VIEW_KEYS: Record<SectionKey, readonly ViewKey[]> = {
  'about': VIEW_KEYS_ABOUT,
  'work': VIEW_KEYS_WORK,
  'articles': VIEW_KEYS_THOUGHTS,
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
 'report-download-hub': ViewCallback[];
 'admin-doc-repo': ViewCallback[];
 'react-native-tzcomp': ViewCallback[];
 'wordpress-plugins': ViewCallback[];
 'personal-site-page': ViewCallback[];
 'articles/building-a-router': ViewCallback[];
}

export function isViewKey(value: string | null): value is ViewKey {
  if (value === null) return false;
  return (VIEW_KEYS as readonly string[]).includes(value);
}

export function getNavbarSection(view: ViewKey): ViewKey | null {
  if (view === 'home') return null;
  let navbarSection: ViewKey | null = null;
  for (const section of ['about', 'work', 'articles'] as SectionKey[]) {
    const keys = SECTION_VIEW_KEYS[section];
    if (view === section || keys.includes(view)) {
      navbarSection = section;
      break;
    }
  }
  
  return navbarSection;
}
