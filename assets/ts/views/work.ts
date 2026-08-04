import { sweepSpanBilateral } from '../shared/header.js';
import { populateProjectCards } from '../shared/projectCards.js';

export default [
    () => sweepSpanBilateral(".name-char"),
    (containerSelector?: string) => populateProjectCards("Work", containerSelector)
];
