import { sweepSpanBilateral } from '../shared/headerSweep.js';
import { populateProjectCards } from '../shared/projectCards.js';

export default [
    () => sweepSpanBilateral(".name-char"),
    (containerSelector?: string) => populateProjectCards("Work", containerSelector)
];
