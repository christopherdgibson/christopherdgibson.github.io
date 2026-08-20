import { initCarousel } from '../shared/carousel.js';
import { initContactIcons } from '../shared/contactIcons.js';
import { populateProjectCardsAsync } from '../shared/projectCards.js';
import { initPreviewSection } from '../shared/previewSection.js';

import type { CallbackProps, ViewCallback } from '../types.js';

export default [
  // () => populateContact('#contactTrigger', '#contactEnvelope', '#contactPageTag'),
  () => initContactIcons('#contactTrigger', '#contactEnvelope', '#contactPageTag'),
  ({containerSelector}: CallbackProps) => initPreviewSection('experience', containerSelector),
  ({containerSelector}: CallbackProps) => initPreviewSection('work', containerSelector),
  () => initCarousel('.tech-row', '.hero-home-tech-stack .badge'),
  ({containerSelector, loadSignal}: CallbackProps) => populateProjectCardsAsync({cardSelector: '.carousel-card', page: "Home", containerSelector, loadSignal})
] satisfies ViewCallback[];
