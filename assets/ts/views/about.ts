import { addBtnListener } from '../shared/nav.js';

export default [
    (containerSelector?: string) => addBtnListener({selector: "#btnWorkAbout", view: "work", containerSelector}),
    (containerSelector?: string) => addBtnListener({selector: "#btnExperienceAbout", view: "experience", containerSelector})
];