import { initCardOverlay, initDemoLaunch } from '../shared/overlays.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "adrDemoModal", "btnAdminDocRepoDemo"),
    () => initDemoLaunch("#screenshotOverlay", "adrDemoModal", "btnAdminDocRepoDemo")
];