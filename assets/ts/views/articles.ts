import { loadView } from '../router.js';
import { initMockHeader } from '../shared/header.js';

import type { ViewKey } from '../types.js';

export default [
    (containerSelector?: string) => initMockHeader({containerSelector, sweepTextSelector: ".diagram-block .mockup-site-name span", sweepEventSelector: ".diagram-block", activeTab: "Thoughts"}),
    (containerSelector?: string) => initArticleLinks(containerSelector)
];

function initArticleLinks(containerSelector?: string) {
    const articles: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('.project-grid a');
    articles.forEach(btn => {
        btn.addEventListener("click", function(event) {
            event.preventDefault();
            loadView({view: btn.dataset.target as ViewKey, containerSelector});
        });
    });
}