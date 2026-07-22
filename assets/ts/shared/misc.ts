import { getContainer, toPascalCase } from '../utils.js';
import loadView from '../router.js';

import type { PreviewViewKey } from '../types.js';


export function scrollToTop(container: Element | (Window & typeof globalThis) = window, behavior: ScrollBehavior = "smooth") {
  container.scrollTo({ top: 0, behavior: behavior });
}

export function scrollToAnchor(target: HTMLElement, container: Element | (Window & typeof globalThis) = window, includeHeader = false, behavior: ScrollBehavior = "smooth") {
  if (!target) return;
  const targetRect = target.getBoundingClientRect();
  let scrollHeight = targetRect.top - 16;
  if (includeHeader === true) {
    const header: HTMLElement | null = document.querySelector("#header");
    let headerHeight = 0;
    if (header) {
      headerHeight = header.offsetHeight;
    }
    if (container != window) {
      const containerEl = container as HTMLElement;
      const containerRect = containerEl.getBoundingClientRect();
      headerHeight += containerRect.top; // account for container's position relative to viewport
    }
    scrollHeight -= headerHeight;
  }
  container.scrollBy({top: scrollHeight, left: 0, behavior: behavior});
}

export function initScrollToTop(container: HTMLElement | (Window & typeof globalThis) = window) {
  const btn = document.querySelector("#scrollToTop");
  if (!btn) return;
  btn.addEventListener("click", function () {
    scrollToTop(container);
  });
}


export function initHeaderLink() {
  const headerLink = document.querySelector("#headerLink");
  if (!headerLink) return;
  headerLink.addEventListener("click", function (event) {
    event.preventDefault();
    loadView("work"); //todo: do these apply to mini-site?
  });
}


export function initContactBtns(triggerSelector: string, envelopeSelector: string) {
  const contactTrigger: HTMLElement | null = document.querySelector(triggerSelector);
  const envelope: HTMLElement | null = document.querySelector(envelopeSelector);
  if (envelope === null || contactTrigger === null) return;
  let stopIdleShake = shakeContactEnvelope(envelope, contactTrigger);
  let inputLocked = false;

  function setExpanded(expanded: boolean) {
    if (inputLocked) return; // ignore calls that arrive during the lockout window
    inputLocked = true;
    setTimeout(() => { inputLocked = false; }, 300);

    contactTrigger?.classList.toggle('expanded-contact', expanded);
    contactTrigger?.setAttribute('aria-expanded', expanded.toString());
    if (expanded) {
      stopIdleShake();
    } else if (envelope !== null && contactTrigger !== null) {
      stopIdleShake = shakeContactEnvelope(envelope, contactTrigger);
    }
  }
  
  envelope?.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return; // ignore touch/pen-simulated hover
    setExpanded(true);
  });

  contactTrigger?.addEventListener('click', () => {
    const isExpanded = contactTrigger.classList.contains('expanded-contact');
    setExpanded(!isExpanded);
  });
}

function shakeContactEnvelope(envelope: HTMLElement, contactTrigger: HTMLElement) {
  if (!envelope.dataset.shakeListenerAttached) {
    envelope.addEventListener('animationend', () => {
      envelope.classList.remove('shake');
    });
    envelope.dataset.shakeListenerAttached = 'true';
  }

  let shakeInterval = setInterval(() => {
    if (contactTrigger.classList.contains('expanded-contact')) return;
    envelope.classList.remove('shake');
    void envelope.offsetWidth;
    envelope.classList.add('shake');
  }, 5000);

  return () => clearInterval(shakeInterval);
}

let previewExpanded: number;
export function initPreviewSection(section: PreviewViewKey, containerSelector?: string) {
  const Section = toPascalCase(section);
  const btn: HTMLAnchorElement | null = document.querySelector(`#btn${Section}Home`);
  const hoverBridge: HTMLElement | null = document.querySelector('.hover-bridge');
  const peekWrapper: HTMLElement | null = document.querySelector(`.peek-wrapper.${section}`);
  const peekBtn: HTMLAnchorElement | null = document.querySelector(`#peekBtn${Section}`);
  const peekPanel: HTMLElement | null = document.querySelector(`#peek${Section}Home`);

  const defaultOrder: Record<PreviewViewKey, string >  = {work: '1', experience: '2'}

  let closeTimer: number;
  previewExpanded = 0;

  function open() {
    clearTimeout(closeTimer);
    peekWrapper?.classList.add('expanded-preview');
  }

  function scheduleClose() {
    if (peekPanel?.classList.contains('expanded-preview')) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      peekWrapper?.classList.remove('expanded-preview');
    }, 200); // grace period to avoid flickering
  }

  if (peekWrapper === null || peekPanel === null) return;
  btn?.addEventListener('mouseenter', () => {
    if (peekPanel?.classList.contains('expanded-preview')) return;
    peekWrapper.style.order = '0';
    open();
  });
  btn?.addEventListener("mouseenter", (event) => {
    event.preventDefault();
    loadView(section, peekPanel, `#peek${Section}Home`, true);
  }, { once: true });
  btn?.addEventListener('mouseleave', () => {
    scheduleClose();
  });

  [peekWrapper, hoverBridge].forEach((el) => {
    el?.addEventListener('mouseenter', () => {
      if (peekWrapper.classList.contains('expanded-preview')) {
        open();
      }
    });
     el?.addEventListener('mouseleave', () => {
      if (peekWrapper.classList.contains('expanded-preview')) {
        scheduleClose();
      }
    });
  });

  peekBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    peekWrapper.style.order = defaultOrder[section];
    peekPanel.classList.toggle('expanded-preview');
    const isExpanded = peekPanel.classList.contains('expanded-preview');
    peekBtn.setAttribute('aria-expanded', isExpanded.toString());
    if (!isExpanded) {
      previewExpanded --;
      scrollToTop(peekPanel); // reset to top when closed
      return;
    }
    if (previewExpanded > 0) {
      const container = getContainer(containerSelector);
      scrollToAnchor(peekWrapper, container); // scroll to preview when multiple open
    }
    previewExpanded ++;
  });
}