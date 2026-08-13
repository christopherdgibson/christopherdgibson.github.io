import { initMockHeader } from '../../shared/header.js';

export default [
    (containerSelector?: string) => initMockHeader({containerSelector, sweepTextSelector: ".diagram-block .mockup-site-name span", sweepEventSelector: ".diagram-block", activeTab: "Thoughts"})
];
