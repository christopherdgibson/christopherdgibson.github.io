import { populateProjectCards } from '../shared/projectCards.js';
import { sweepSpanBilateral } from '../shared/headerSweep.js';


export default [
    () => sweepSpanBilateral(".name-char"),
    (containerSelector?: string) => populateProjectCards("Work", containerSelector)
];