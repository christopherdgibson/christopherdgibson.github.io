import { getCleanElement } from '../utils.js';
import { VIEW_KEYS_WORK, type CreateHTMLProps } from '../types';

export function createCarouselDots({selector = '#carouselWrapper #carouselDots', className = 'carousel-dot', containerSelector}: CreateHTMLProps) {
  const dotsSelector = `${containerSelector ?? ''} ${selector ?? ''}`;
  if (dotsSelector.trim() === '') return;

  const carouselDots = document.querySelector(dotsSelector);
  if (carouselDots === null) return;

  for (let i = 1; i < VIEW_KEYS_WORK.length; i++) { // Keep index 0 activeCarousel hard-coded html item
    const dotDiv = document.createElement('div');
    dotDiv.className = className;
    dotDiv.dataset.index = i.toString();
    carouselDots.appendChild(dotDiv)
  }
}

export function initCarousel(loadSignal: AbortSignal, rowSelector?: string, badgeSelector?: string) {
  const track = getCleanElement("#carouselTrack");
  if (!track) return;
  const dots: NodeListOf<HTMLAnchorElement> = document.querySelectorAll("#carouselWrapper .carousel-dot"); // clean dot elements as well with getCleanElements()?
  const prev = getCleanElement("#carouselPrev");
  const next = getCleanElement("#carouselNext");
  const navItems = document.querySelectorAll("#carouselWrapper .mockup-nav-item");
  const total = dots.length;

  const badges: NodeListOf<HTMLElement> | null = badgeSelector ? document.querySelectorAll(badgeSelector) : null;
  const rows: NodeListOf<HTMLElement> | null = rowSelector ? document.querySelectorAll(rowSelector) : null;

  const startupPulses = document.querySelectorAll(`${rowSelector}.activeCarousel, ${badgeSelector}.activeCarousel`);

  startupPulses.forEach(badge => {
    badge.classList.add('badge-pulse-once');
    badge.addEventListener('animationend', () => {
      badge.classList.remove('badge-pulse-once');
    }, { once: true });
  });

  let current = 0;
  let autoplay: number;

  function setActive(index: number) {
    navItems.forEach((item, i) => item.classList.toggle("activeCarousel", i === index));
    dots.forEach((d, i) => d.classList.toggle("activeCarousel", i === index));
    rows?.forEach((r, i) => r.classList.toggle("activeCarousel", i === index));
    const activeRow = rows?.item(index);
    badges?.forEach((b, i) => {
      if (activeRow?.dataset.stack && b.dataset.stack) {
        b.classList.toggle("activeCarousel", activeRow?.dataset.stack.includes(b.dataset.stack.toString()))
      }
    });
    if (track) {
      track.style.transform = `translateX(-${index * 100}%)`;
    }
  }

  function goTo(index: number) {
    current = (index + total) % total;
    setActive(current);
  }

  function stopAutoplay() {
    clearInterval(autoplay);
  }

  function startInterval() {
    autoplay = setInterval(() => goTo(current + 1), 3500);
  }

  function resetAutoplay() {
    stopAutoplay();
    startInterval();
  }

  // add event listeners
  prev?.addEventListener("click", () => {
    goTo(current - 1);
    resetAutoplay();
  });
  next?.addEventListener("click", () => {
    goTo(current + 1);
    resetAutoplay();
  });
  dots.forEach((d) =>
    d.addEventListener("click", () => {
      if (d.dataset.index) {
        goTo(+d.dataset.index);
        resetAutoplay();
      }
    }),
  );

  if (rows) {
    rows.forEach((d) => {
        d.addEventListener("mouseenter", () => {
          if (d.dataset.index) {
          goTo(+d.dataset.index);
          stopAutoplay();
          }
        });
        d.addEventListener("mouseleave", () => {
          startInterval();
        });
      }
    );
  }
  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startInterval);

  loadSignal.addEventListener('abort', stopAutoplay, {once: true});

  // Start carousel
  startInterval();
}
