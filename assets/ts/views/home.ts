import { initContactBtns, initPreviewSection } from '../shared/misc.js';
import { initCarousel } from '../shared/carousel.js';
import { populateProjectCards, addHomeTableBtns } from '../shared/projectCards.js';
import { addBtnListener } from '../shared/nav.js';


export default [
  () => initContactBtns('#contactTrigger', '#contactEnvelope', '#contactPageTag'),
  (containerSelector?: string) => initPreviewSection('experience', containerSelector),
  (containerSelector?: string) => initPreviewSection('work', containerSelector),
  () => initCarousel('.tech-row', '.hero-home-tech-stack .badge'),
  (containerSelector?: string) => populateProjectCards("Home", containerSelector),
  (containerSelector?: string) => addHomeTableBtns(containerSelector),
  (containerSelector?: string) => addBtnListener(".hero-home-header-grid .headshot", "about", containerSelector),
  (containerSelector?: string) => addBtnListener("#btnWorkHome", "work", containerSelector),
  (containerSelector?: string) => addBtnListener("#btnExperienceHome", "experience", containerSelector)
];
