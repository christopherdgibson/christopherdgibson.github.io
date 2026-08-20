import { initCarousel } from '../shared/carousel.js';
import { initContactIcons } from '../shared/contactIcons.js';
import { populateProjectCardsAsync } from '../shared/projectCards.js';
import { initPreviewSection } from '../shared/previewSection.js';

import type { CallbackProps, ViewCallback } from '../types.js';

export default [
  // () => populateContact('#contactTrigger', '#contactEnvelope', '#contactPageTag'),
  () => initContactIcons('#contactTrigger', '#contactEnvelope', '#contactPageTag'),
  ({containerSelector, loadSignal}: CallbackProps) => initPreviewSection({section: 'experience', containerSelector, loadSignal}),
  ({containerSelector, loadSignal}: CallbackProps) => initPreviewSection({section: 'work', containerSelector, loadSignal}),
  () => initCarousel('.tech-row', '.hero-home-tech-stack .badge'),
  ({containerSelector, loadSignal}: CallbackProps) => populateProjectCardsAsync({cardSelector: '.carousel-card', page: "Home", containerSelector, loadSignal})
] satisfies ViewCallback[];
