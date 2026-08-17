import { sweepSpanBilateral } from '../shared/header.js';
import { populateProjectCards } from '../shared/projectCards.js';
import { initHrefs } from '../router.js';

export default [
    () => sweepSpanBilateral(".name-char"),
    (containerSelector?: string) => populateProjectCards({cardSelector: '.project-grid a', page: "Work", containerSelector}),
    (containerSelector?: string) => initHrefs({containerSelector})
];
