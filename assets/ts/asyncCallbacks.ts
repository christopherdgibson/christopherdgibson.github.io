import { fetchSvgIcon } from './shared/asyncFetch.js';
import { initHref } from './router.js';

import type { CallbackProps, ViewCallback } from './types.js';

interface InitHrefsProps {
  containerSelector?: string;
  bodyElement?: HTMLElement | null;
  viewSelector?: string;
}

interface InitSvgProps {
  bodyElement?: HTMLElement;
  iconSelector?: string;
  signal: AbortSignal;
}

interface AsyncCallbackProps extends CallbackProps {
  contentOnly?: boolean;
}

export function getAsyncCallbacks({bodyElement, containerSelector, loadSignal, contentOnly}: AsyncCallbackProps) {
  return [
    ...(contentOnly === false ? [
        () => initHrefs({bodyElement, containerSelector}), // override for contentOnly to avoid document-wide event stacking
    ] : []),
    () => initSvgIcons({bodyElement, signal: loadSignal})
  ] satisfies ViewCallback[];
}

function initHrefs({viewSelector, bodyElement=document.querySelector('#body-placeholder'), containerSelector}: InitHrefsProps) {
  if (bodyElement === null) return; // Return early instead of console errors from loadView

  const links: NodeListOf<HTMLAnchorElement> = bodyElement.querySelectorAll(`${viewSelector ?? ''} a`);
  links.forEach(link => {
      initHref({link, bodyElement, containerSelector});
  })
}

export async function initSvgIcons({bodyElement, iconSelector = ".svg-icon", signal}: InitSvgProps) {
  const parentNode = bodyElement ? bodyElement : document;
  const icons: NodeListOf<HTMLElement> = parentNode.querySelectorAll(iconSelector);
  if (!icons.length) return;

  await Promise.all(Array.from(icons).map(async (icon) => {
      if (!icon.dataset.target) return;
      fetchSvgIcon({iconEl: icon, iconName: `${icon.dataset.target}`, signal});
  }));
}
