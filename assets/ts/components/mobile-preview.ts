import { fetchFragment } from '../shared/misc.js';
import { initCloseModalBtn, closeOverlays } from '../shared/overlays.js';
import { getContainer, removeClasses, toPascalCase } from '../utils.js';

type MobilePreviewProps = {
  containerSelector?: string;
  loadSignal: AbortSignal;
  overlaySelector?: string;
  itemId?: string;
  btnId?: string;
}

type OpenPreviewProps = {
  modal: HTMLElement;
  overlay: HTMLElement;
  containerSelector?: string;
  loadSignal: AbortSignal;
  previewSelector?: string
}

export function initMobilePreview({containerSelector, loadSignal, overlaySelector = ".mobile-preview-overlay", itemId = "mobilePreviewCard", btnId}: MobilePreviewProps) {
  btnId = btnId ?? `btn${toPascalCase(itemId)}`;
  const overlay: HTMLElement | null = document.querySelector(overlaySelector);
  const btn: HTMLElement | null = document.getElementById(btnId);

  if (!overlay || !btn) {
    return;
  }

  const modal = document.getElementById(itemId);
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    openPreview({modal, overlay, containerSelector, loadSignal});
  });

  overlay.addEventListener('click', function() {
    modal?.classList.remove('expanded');
    overlay.classList.remove('active');
  });
}

async function openPreview ({modal, overlay, previewSelector = '#mobilePreviewCard', containerSelector, loadSignal} : OpenPreviewProps) {
  const container = getContainer(containerSelector);
  const parentContainer = container !== window ? container as HTMLElement : document;
  const preview: HTMLElement | null = parentContainer.querySelector(previewSelector);

  if (preview === null) return;

  if (window.self !== window.top) {
    const limitModal: HTMLElement | null = document.querySelector('#miniSiteLimitCard');
    const limitOverlay: HTMLElement | null = document.querySelector('#screenshotOverlay');
    limitModal?.classList.add("expanded");
    limitOverlay?.classList.add("active");

    initCloseModalBtn(limitModal, limitOverlay);
    return;
  }

  closeOverlays([".card-overlay", ".screenshot-overlay"].join(",")); // in case other overlays are open;
  removeClasses(['expanded']); // in case other cards are expanded
  modal?.classList.add("expanded");
  overlay.classList.add("active");

  if (preview.dataset.iframeOpen === "true") return;

  try {
    const html = await fetchFragment({path: `components/mobile-preview.html`,
      signal: loadSignal,
      validate: (response) => {
        if (!response.ok) throw new Error('Mobile preview not found');
        return true;
      }
    })
    
    if (html === null) return;

    preview.innerHTML = html;
    preview.dataset.iframeOpen = "true";
    initCloseModalBtn(modal, overlay);
  } catch(error) {
    console.error(error)
  };
}