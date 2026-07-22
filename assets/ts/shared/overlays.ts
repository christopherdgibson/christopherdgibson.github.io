import { toPascalCase, removeClasses } from '../utils.js';

export function initCardOverlay(overlaySelector: string, itemId: string, btnId?: string) {
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
    closeOverlays([".card-overlay", ".screenshot-overlay"].join(",")); // in case other overlays are open;
    removeClasses(['expanded']); // in case other cards are expanded
    modal?.classList.add("expanded");
    overlay.classList.add("active");
  });

  closeModalAndOverlay(modal, overlay);
}

export function closeOverlays(overlaySelectors: string) {
  const overlays = document.querySelectorAll(overlaySelectors);
  overlays.forEach((overlay) => {
      removeClasses(['active']);
  });
}

export function closeModalAndOverlay(modal: HTMLElement | null, overlay: HTMLElement, closeSelector: string = '.page-tag-close') {
  const closeBtn = modal?.querySelector(closeSelector);
  if (!closeBtn) {
    return;
  }

  closeBtn.addEventListener('click', function() {
    modal?.classList.remove('expanded');
    overlay.classList.remove('active');
  });
}

// Download modal
export function initDownloadModal() {
  let downloadBtn: HTMLAnchorElement | null = document.querySelector('#btnDownloadConfirm');
  let downloadOptions: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('#reportDownloadHubExe .download-option');
  let downloadModal: HTMLElement | null = document.getElementById('reportDownloadHubExe');
  let downloadConfirmModal: HTMLElement | null = document.getElementById('downloadConfirmModal');
  downloadOptions.forEach(downloadOption => {
    downloadOption.addEventListener('click', (e: Event) => {
      e.preventDefault();
      const pendingDownloadUrl = downloadOption.href;
      const modalHighlight: HTMLElement | null = document.querySelector('.modal-highlight');
      const footerNote = document.querySelector('.modal-footer-note');

      if (modalHighlight) {
      modalHighlight.textContent = downloadOption.dataset.platform ?? '';
      }
      if (footerNote) {
        footerNote.textContent = downloadOption.dataset.note ?? '';
      }
      if (pendingDownloadUrl && downloadBtn) {
        downloadBtn.href = pendingDownloadUrl;
      }

      downloadModal?.classList.add('hidden');
      downloadConfirmModal?.classList.remove('hidden');
      downloadConfirmModal?.classList.add('expanded');
    });
  });

  downloadBtn?.addEventListener('click', () => {
    showToast('Your download will begin shortly.');
  });
  
  downloadConfirmModal?.querySelectorAll('[id]').forEach(btn => {
    btn.addEventListener('click', () => {
      downloadConfirmModal.classList.add('hidden');
      downloadModal?.classList.remove('hidden');
    });
  });

  // downloadModal.querySelector('.page-tag-close').addEventListener('click', function() {
  //   downloadModal.classList.remove('expanded');
  //   document.getElementById('screenshotOverlay').classList.remove('active');
  // });
}

export function showModal(modalId: string, show: boolean = true) {
  const modal = document.getElementById(modalId);
  if (modal) {
    if (show) {
    removeClasses(['expanded']);
    modal.classList.add("expanded");
    } else {
    modal.classList.remove("expanded");
    }
  }
}

export function showToast(message: string, duration: number = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), duration);
}

// Wordpress demo countdown

export function initDemoLaunch(overlaySelector: string, itemId: string, btnId: string) {
  btnId = btnId ?? `btn${toPascalCase(itemId)}`;
  const overlay: HTMLElement | null = document.querySelector(overlaySelector);
  const btn = document.getElementById(btnId);
  const modal = document.getElementById(itemId);

  if (!overlay || !btn || !modal) {
    return;
  }

  let state: {interval: number, modal: HTMLElement | null, overlay: HTMLElement | null}  = { interval: 0 , modal: null, overlay: null };

  function closeDemoLaunch() {
    clearInterval(state.interval);
    state.modal?.classList.remove('expanded');
    state.overlay?.classList.remove('active');
  }

  btn.addEventListener("click", function (e) {
    let count = 5;
    const countdownEl = modal.querySelector('.demo-redirect .download-option-platform');
    const launchNowEl = modal.querySelector('.download-option .download-option-platform');
    const closeEl = modal.querySelector('.page-tag-close-container');

    if (countdownEl) {
      countdownEl.textContent = `Launching in ${count}s...`;
    }

    const interval = setInterval(() => {
      if (countdownEl){
        countdownEl.textContent = `Launching in ${--count}s...`;
      }
      if (count === 0) {
          clearInterval(interval);
          launchUrl('https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/christopherdgibson/christopherdgibson.github.io/main/assets/demos/blueprint-wp-plugins.json', '_blank');
          
          modal.classList.remove('expanded');
          overlay.classList.remove('active');
      }
    }, 1000);

    state.interval = interval;
    state.modal = modal;
    state.overlay = overlay;

    [countdownEl, launchNowEl, closeEl].forEach(el => {
      if (el) {
        el.addEventListener('click', closeDemoLaunch); // same reference every time — auto-deduped, no WeakSet needed
      }
    });
  });
}

function launchUrl(url: string, target: string) {
    const a = document.createElement('a');
    a.href = url;
    a.target = target;
    a.rel = 'noopener noreferrer';
    a.click();
}

function delayedUrlLaunch(overlay: HTMLElement, modal: HTMLElement, countdownEl: HTMLElement, url: string) {
  let count = 5;
  const interval = setInterval(() => {
      countdownEl.textContent = `Launching in ${--count}s...`;
      if (count === 0) {
          clearInterval(interval);
          window.open(url, '_blank');
          
          modal.classList.remove('expanded');
          overlay.classList.remove('active');
      }
  }, 1000);
}
