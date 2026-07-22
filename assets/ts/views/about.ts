import { addBtnListener } from '../shared/nav.js';

export default [
    (containerSelector?: string) => addBtnListener("#btnWorkAbout", "work", containerSelector),
    (containerSelector?: string) => addBtnListener("#btnExperienceAbout", "experience", containerSelector)
];