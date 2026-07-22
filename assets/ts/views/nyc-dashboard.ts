import { sweepSpanBilateral } from '../shared/headerSweep.js';
import { populateProjectCards, addHomeTableBtns } from '../shared/projectCards.js';

export default [
    () => sweepSpanBilateral(".name-char"),
    (containerSelector?: string) => populateProjectCards("Work", containerSelector)
];