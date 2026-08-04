import { initMockHeader } from '../../shared/header.js';

export default [
    (containerSelector?: string) => initMockHeader({containerSelector, textSelector: ".diagram-block .mockup-site-name span", eventSelector: ".diagram-block", activeTab: "Thoughts"})
];
