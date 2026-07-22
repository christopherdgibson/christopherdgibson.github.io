import { initCardOverlay, initDemoLaunch } from '../shared/overlays.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "wpDemoModal", "btnWordPressDemo"),
    () => initDemoLaunch("#screenshotOverlay", "wpDemoModal", "btnWordPressDemo"),
    () => initCardOverlay("#screenshotOverlay", "wpGithubModal", "btnWordPressGithub")
];