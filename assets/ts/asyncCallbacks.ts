import { fetchSvgIcon } from './shared/misc.js';
import { initHref } from './router.js';

import type { CallbackProps, ViewCallback } from './types.js';

interface InitHrefsProps {
  containerSelector: string;
  bodyElement?: HTMLElement;
  viewSelector?: string;
}

interface AsyncCallbackProps extends CallbackProps {
    contentOnly?: boolean;
}

export function getAsyncCallbacks({bodyElement, containerSelector, contentOnly}: AsyncCallbackProps) {
  return [
    ...(contentOnly === false ? [
        () => initHrefs({bodyElement, containerSelector}), // override for contentOnly to avoid document-wide event stacking
    ] : []),
    () => initSvgIcons({bodyElement})
  ] satisfies ViewCallback[];
}

function initHrefs({viewSelector, bodyElement=document.querySelector('#body-placeholder'), containerSelector}: InitHrefsProps) {
    const links: NodeListOf<HTMLAnchorElement> = bodyElement.querySelectorAll(`${viewSelector ?? ''} a`);
    links.forEach(link => {
        initHref({link, bodyElement, containerSelector});
    })
}

export function initSvgIcons({bodyElement, iconSelector = ".svg-icon"}: {bodyElement?: HTMLElement, iconSelector?: string}) {
    const parentNode = bodyElement ? bodyElement : document;
    const icons: NodeListOf<HTMLElement> = parentNode.querySelectorAll(iconSelector);
    if (!icons.length) return;
    
    icons.forEach((icon) => {
        if (!icon.dataset.target) return;
        fetchSvgIcon(icon, `${icon.dataset.target}`);
    });
}