import { initSvgIcons } from '../baseCallbacks.js';
import { fetchFragment  } from './misc.js';

interface PopulateContactProps {
  triggerSelector?: string;
  envelopeSelector: string;
  pageTagSelector?: string;
  isLoadCurrent: () => boolean;
}

export async function populateContactAsync({triggerSelector = "contact-trigger", envelopeSelector, pageTagSelector, isLoadCurrent}: PopulateContactProps) {
  const target: HTMLElement | null = document.querySelector(triggerSelector);

  if (target === null) return;
  await fetchFragment({
    path: `components/contact-envelope.html`,
    validate: (response) => {
      if (!response.ok) throw new Error(`View not found: contact-envelope.html`);
      return true;
    }
  })
  .then((html) => {
    if (!isLoadCurrent()) return;
    target.innerHTML = html;
    initSvgIcons('.spill-icon');
    initContactIcons(triggerSelector, envelopeSelector, pageTagSelector);
  })
  .catch((err) => console.error(err));
}

export function initContactIcons(triggerSelector: string, envelopeSelector: string, pageTagSelector?: string) {
  const contactTrigger: HTMLElement | null = document.querySelector(triggerSelector);
  const envelope: HTMLElement | null = document.querySelector(envelopeSelector);
  const pageTag: HTMLElement | null = document.querySelector(pageTagSelector);
  if (envelope === null || contactTrigger === null) return;
  let stopIdleShake = shakeContactEnvelope(envelope, contactTrigger);
  let inputLocked = false;

  function scheduleExpanded(expanded: boolean) {
    if (expanded && envelope.classList.contains('shake')) {
        envelope.addEventListener('animationend', () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setExpanded(expanded);
                });
            });
        }, { once: true });
    } else {
        setExpanded(expanded);
    }
  }

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
    scheduleExpanded(true);
  });

  contactTrigger?.addEventListener('click', () => {
    const isExpanded = contactTrigger.classList.contains('expanded-contact');
    scheduleExpanded(!isExpanded);
  });

  pageTag?.addEventListener('click', () => scheduleExpanded(true));
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
    void envelope.offsetWidth; // forces reflow
    envelope.classList.add('shake');
  }, 5000);

  return () => clearInterval(shakeInterval);
}
