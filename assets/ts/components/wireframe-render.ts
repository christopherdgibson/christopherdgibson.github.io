interface RawImageDataProps {
  width: number;
  height: number;
  gray: Float32Array<ArrayBuffer>;
}

interface SobelEdgesProps extends RawImageDataProps {
  threshold: number;
}

class WireframeEffect {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  statusEl: HTMLElement | null;
  thresholdSlider: HTMLInputElement | null;
  glowSlider: HTMLInputElement | null;
  lineColorInput: HTMLInputElement | null;
  invertCheckbox: HTMLInputElement | null;

  sourceImg: HTMLImageElement | null = null;
  rawImageData: RawImageDataProps | null = null;

  constructor(elements: {
    canvas: HTMLCanvasElement;
    statusEl: HTMLElement | null;
    thresholdSlider: HTMLInputElement | null;
    glowSlider: HTMLInputElement | null;
    lineColorInput: HTMLInputElement | null;
    invertCheckbox: HTMLInputElement | null;
  }) {
    this.canvas = elements.canvas;
    const ctx = elements.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
    this.statusEl = elements.statusEl;
    this.thresholdSlider = elements.thresholdSlider;
    this.glowSlider = elements.glowSlider;
    this.lineColorInput = elements.lineColorInput;
    this.invertCheckbox = elements.invertCheckbox;
  }

  loadImage = (src: string | HTMLImageElement) => {
    if (!this.statusEl) return;
    this.statusEl.textContent = "Loading image…";
    const img = typeof src === "string" ? new Image() : src;

    if (typeof src === "string") {
      const isSameOriginOrData =
        src.startsWith("data:") ||
        src.startsWith("/") ||
        src.startsWith(window.location.origin);
      if (!isSameOriginOrData) img.crossOrigin = "anonymous";
    }

    img.onerror = () => {
      if (this.statusEl)
        this.statusEl.textContent = "Could not load that image.";
    };

    if (img.complete && img.naturalWidth > 0) {
      this.sourceImg = img;
      this.prepareImageData(img);
      this.render();
      this.statusEl.textContent = "Ready.";
    } else {
      img.onload = () => {
        this.sourceImg = img;
        this.prepareImageData(img);
        this.render();
        if (this.statusEl) this.statusEl.textContent = "Ready.";
      };
    }

    if (typeof src === "string") img.src = src;
  };

  prepareImageData = (image: HTMLImageElement) => {
    if (!this.canvas) return;
    // Fit image into canvas, preserving aspect ratio
    const targetW = 600,
      targetH = 750;
    this.canvas.width = targetW;
    this.canvas.height = targetH;

    const off = document.createElement("canvas");
    off.width = targetW;
    off.height = targetH;
    const octx = off.getContext("2d");

    const scale = Math.max(
      targetW / image.width,
      targetH / image.height,
    );
    const w = image.width * scale,
      h = image.height * scale;
    const x = (targetW - w) / 2,
      y = (targetH - h) / 2;

    if (!octx) return;
    octx.fillStyle = "#000";
    octx.fillRect(0, 0, targetW, targetH);
    octx.drawImage(image, x, y, w, h);

    const imgData = octx.getImageData(0, 0, targetW, targetH);
    const gray = new Float32Array(targetW * targetH);
    for (let i = 0; i < targetW * targetH; i++) {
      const r = imgData.data[i * 4],
        g = imgData.data[i * 4 + 1],
        b = imgData.data[i * 4 + 2];
      gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
    this.rawImageData = { width: targetW, height: targetH, gray };
  };

  render = () => {
    if (!this.rawImageData || !this.thresholdSlider || !this.glowSlider) return;
    const { width: w, height: h, gray } = this.rawImageData;
    const threshold = parseInt(this.thresholdSlider.value, 10);
    const glow = parseInt(this.glowSlider?.value, 10);
    const lineColor = this.lineColorInput?.value ?? "#39ff88";
    const invert = this.invertCheckbox?.checked;

    const edges = sobelEdges({width: w, height: h, gray, threshold});

    this.ctx.fillStyle = invert ? "#f5f5f0" : "#050807";
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.save();
    this.ctx.fillStyle = lineColor;
    if (glow > 0) {
      this.ctx.shadowColor = lineColor;
      this.ctx.shadowBlur = glow;
    }
    if (invert) {
      this.ctx.fillStyle = "#111";
      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
    }

    const out = this.ctx.createImageData(w, h);
    const lineRGB = hexToRgb(invert ? "#111111" : lineColor);
    for (let p = 0; p < w * h; p++) {
      const on = edges[p] > 0;
      const idx = p * 4;
      if (on) {
        out.data[idx] = lineRGB.r;
        out.data[idx + 1] = lineRGB.g;
        out.data[idx + 2] = lineRGB.b;
        out.data[idx + 3] = 255;
      } else {
        out.data[idx] = invert ? 245 : 5;
        out.data[idx + 1] = invert ? 245 : 8;
        out.data[idx + 2] = invert ? 240 : 7;
        out.data[idx + 3] = 255;
      }
    }
    this.ctx.putImageData(out, 0, 0);

    // Add glow pass by drawing edge points again with shadow (putImageData ignores shadow)
    if (glow > 0) {
      this.ctx.globalCompositeOperation = "lighter";
      this.ctx.fillStyle = lineColor;
      this.ctx.shadowColor = lineColor;
      this.ctx.shadowBlur = glow;
      for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
          if (edges[y * w + x] > 0) {
            this.ctx.fillRect(x, y, 1.4, 1.4);
          }
        }
      }
      this.ctx.globalCompositeOperation = "source-over";
    }

    this.ctx.restore();
  };
}

function sobelEdges({width, height, gray, threshold}: SobelEdgesProps) {
  const edges = new Uint8ClampedArray(width * height);
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sx = 0,
        sy = 0,
        k = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const val = gray[(y + j) * width + (x + i)];
          sx += val * gx[k];
          sy += val * gy[k];
          k++;
        }
      }
      const mag = Math.sqrt(sx * sx + sy * sy);
      edges[y * width + x] = mag > threshold ? 255 : 0;
    }
  }
  return edges;
}

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const bigint = parseInt(m, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

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

  const DEFAULT_IMAGE_URL = 'https://picsum.photos/id/669/1200/1200';

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
