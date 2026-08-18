import { fetchSvgIcon } from './shared/misc.js';
import { initHref } from './router.js';

import type { CallbackProps, ViewCallback } from './types.js';

interface InitHrefsProps {
  containerSelector: string;
  bodyElement?: HTMLElement;
  viewSelector?: string;
}

export const asyncCallbacks = [
    ({bodyElement = document.querySelector('#body-placeholder'), containerSelector}: CallbackProps) => initHrefs({bodyElement, containerSelector}),
    ({bodyElement}: CallbackProps) => initSvgIcons({bodyElement})
] satisfies ViewCallback[];

function initHrefs({viewSelector, bodyElement=document.querySelector('#body-placeholder'), containerSelector}: InitHrefsProps) {
    console.log('containerSelector: ', containerSelector);
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