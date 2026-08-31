export function initCurtainPreview(overlaySelector: string = '.curtain-preview-overlay') {
  const overlay: HTMLElement | null = document.querySelector(overlaySelector);
  const btnCurtainPreview = document.querySelector('#btnCurtainPreviewCard');

  if (!overlay || !btnCurtainPreview) {
    return;
  }
  
  const submenu: HTMLElement | null = overlay.querySelector('.curtain-demo-submenu');

  ensureRays();
  btnCurtainPreview.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    overlay.classList.remove('active',  'cycle');
    void submenu?.offsetWidth; // reflow for re-trigger
    overlay.classList.add('active', 'cycle');
  });

  overlay.addEventListener('animationend', (e) => {
    if (e.animationName !== 'rayIn') return;
    overlay.classList.remove('active', 'cycle');
  });
}

function ensureRays(rays?: HTMLElement | null) {
    rays = rays ?? document.getElementById("rays");

    if (rays?.childElementCount === 0) {
      const n = 10; 
      for (let i = 0; i < n; i++) {
        const r = document.createElement("div");
        r.className = "ray";
        r.style.setProperty("--rot", i * (360 / n) + "deg");
        rays.appendChild(r);
      }
    }
}