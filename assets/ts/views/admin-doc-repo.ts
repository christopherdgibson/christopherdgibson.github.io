import { initCardOverlay, initDemoLaunch } from '../shared/overlays.js';

import type { ViewCallback } from '../types.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "adrDemoModal", "btnAdminDocRepoDemo"),
    () => initDemoLaunch("#screenshotOverlay", "adrDemoModal", "btnAdminDocRepoDemo")
] satisfies ViewCallback[];
