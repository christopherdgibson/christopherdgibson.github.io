import { getCleanElement } from '../utils.js';

// Carousel JS

export function initCarousel(rowSelector?: string, badgeSelector?: string) {
  const track = getCleanElement("#carouselTrack");
  if (!track) return;
  const dots: NodeListOf<HTMLAnchorElement> = document.querySelectorAll("#carouselWrapper .carousel-dot"); // clean dot elements as well with getCleanElements()?
  const prev = getCleanElement("#carouselPrev");
  const next = getCleanElement("#carouselNext");
  const navItems = document.querySelectorAll("#carouselNav .mockup-nav-item");
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
    // badges?.forEach((b, i) => b.classList.toggle("activeCarousel", +b.dataset.index.includes(index)));
    // track.style.transform = `translateX(-${index * 100}%)`;
    badges?.forEach((b, i) => {
      if (b.dataset.index) {
        b.classList.toggle("activeCarousel", +b.dataset.index.includes(index.toString()) > 0)
      }});
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

  // start
  startInterval();
}