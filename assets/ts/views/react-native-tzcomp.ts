import { initCardOverlay } from '../shared/overlays.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "tzCompApk", "btnTZCompApk"),
    //() => initDownloadModal() // todo: generalise so not just reportDownloadHub

];