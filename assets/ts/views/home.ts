import { createCarouselDots, initCarousel } from '../shared/carousel.js';
import { initContactIcons } from '../shared/contactIcons.js';
import { initPreviewSection } from '../shared/previewSection.js';
import { PROJECT_CARD_DETAILS, createProjectCards, populateProjectCardsAsync } from '../shared/projectCards.js';
import { VIEW_KEYS_WORK, type CallbackProps, CreateHTMLProps, ProjectKey, ViewCallback } from '../types.js';

export default [
  // () => populateContact('#contactTrigger', '#contactEnvelope', '#contactPageTag'),
  () => initContactIcons('#contactTrigger', '#contactEnvelope', '#contactPageTag'),
  ({containerSelector}: CallbackProps) => createProjectsTable({selector: '.hero-home-portfolio-projects .tech-list', containerSelector}),
  ({containerSelector}: CallbackProps) => createProjectCards({selector: '#carouselWrapper #carouselTrack', className: 'carousel-card', containerSelector}),
  ({containerSelector}: CallbackProps) => createCarouselDots({containerSelector}),
  ({containerSelector, loadSignal}: CallbackProps) => initPreviewSection({section: 'experience', containerSelector, loadSignal}),
  ({containerSelector, loadSignal}: CallbackProps) => initPreviewSection({section: 'work', containerSelector, loadSignal}),
  ({loadSignal}: CallbackProps) => initCarousel(loadSignal, '.tech-row', '.hero-home-tech-stack .badge'),
  ({containerSelector, loadSignal}: CallbackProps) => populateProjectCardsAsync({cardSelector: '.carousel-card', page: "Home", containerSelector, loadSignal})
] satisfies ViewCallback[];

export function createProjectsTable({selector = '.hero-home-portfolio-projects .tech-list', containerSelector}: CreateHTMLProps) {
  const projectTableSelector = `${containerSelector ?? ''} ${selector ?? ''}`;
  if (projectTableSelector.trim() === '') return;
  
  const projectTable = document.querySelector(projectTableSelector);
  if (projectTable === null) return;

  projectTable.replaceChildren(
    ...VIEW_KEYS_WORK.map((key, i) => projectTableRow(key, i))
  );
}

function projectTableRow(key: ProjectKey, index: number): HTMLElement {
  const card = PROJECT_CARD_DETAILS[key];

  const atag = document.createElement('a');
  atag.href = key;
  atag.classList.add('tech-row');
  if (index === 0) atag.classList.add('activeCarousel');
  atag.dataset.index = index.toString();
  atag.dataset.stack = card.dataStack;
  atag.innerHTML = `<div class="tech-key">${card.title}</div><div class="tech-val">${card.techStack}</div>`;

  return atag;
}
