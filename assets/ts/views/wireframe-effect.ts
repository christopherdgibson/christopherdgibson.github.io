import { WireframeEffect } from '../components/wireframe-render.js';
import { initCarouselFlex } from '../components/carousel-flex.js';

import type { CallbackProps, ViewCallback } from '../types.js';

export default [
    ({loadSignal}: CallbackProps) => initCarouselFlex(loadSignal),
    () => initWireframeEffect()
] satisfies ViewCallback[];


export async function initWireframeEffect() {
  const canvas: HTMLCanvasElement | null = document.getElementById("canvas") as HTMLCanvasElement | null;
  const statusEl = document.getElementById("status");
  const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
  const resetBtn = document.getElementById("resetBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const thresholdSlider = document.getElementById("threshold") as HTMLInputElement | null;
  const glowSlider = document.getElementById("glow") as HTMLInputElement | null;
  const lineColorInput = document.getElementById("lineColor") as HTMLInputElement | null;
  const invertCheckbox = document.getElementById("invert") as HTMLInputElement | null;

  const DEFAULT_IMAGE_URL = 'https://picsum.photos/id/823/1200/1200';

  if (!canvas) return;

  const effect = new WireframeEffect({ canvas, statusEl, thresholdSlider, glowSlider, lineColorInput, invertCheckbox });

  const carouselImages: NodeListOf<HTMLImageElement> = document.querySelectorAll('.carousel-flex-wrapper img');

  resetBtn?.addEventListener("click", () => effect.loadImage(DEFAULT_IMAGE_URL));
  [thresholdSlider, glowSlider, lineColorInput, invertCheckbox].forEach(el => {
    el?.addEventListener("input", effect.render);
  });
  carouselImages?.forEach(img => img.addEventListener("click", () => effect.loadImage(img.src)));

  downloadBtn?.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "wireframe-portrait.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  fileInput?.addEventListener("change", (e) => {
    const files = fileInput.files;
    if (!files) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        effect.loadImage(result);
      }
    }
    reader.readAsDataURL(file);
  });

  effect.loadImage(DEFAULT_IMAGE_URL);
}