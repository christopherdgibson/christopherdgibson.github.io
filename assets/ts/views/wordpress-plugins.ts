import { initCardOverlay, initDemoLaunch } from '../shared/overlays.js';

import type { ViewCallback } from '../types.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "wpDemoModal", "btnWordPressDemo"),
    () => initDemoLaunch("#screenshotOverlay", "wpDemoModal", "btnWordPressDemo"),
    () => initCardOverlay("#screenshotOverlay", "wpGithubModal", "btnWordPressGithub")
] satisfies ViewCallback[];
