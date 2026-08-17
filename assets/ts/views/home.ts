import { initHrefs } from '../baseCallbacks.js';
import { initCarousel } from '../shared/carousel.js';
import { initContactIcons } from '../shared/contactIcons.js';
import { populateProjectCards } from '../shared/projectCards.js';
import { initPreviewSection } from '../shared/previewSection.js';

export default [
  // () => populateContact('#contactTrigger', '#contactEnvelope', '#contactPageTag'),
  () => initContactIcons('#contactTrigger', '#contactEnvelope', '#contactPageTag'),
  (containerSelector?: string) => initPreviewSection('experience', containerSelector),
  (containerSelector?: string) => initPreviewSection('work', containerSelector),
  () => initCarousel('.tech-row', '.hero-home-tech-stack .badge'),
  (containerSelector?: string) => populateProjectCards("Home", containerSelector),
  (containerSelector?: string) => initHrefs({viewSelector: '.home-container', containerSelector})
];
