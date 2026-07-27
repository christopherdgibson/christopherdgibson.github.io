import { initCardOverlay, initDownloadModal } from '../shared/overlays.js';

export default [
    () => initCardOverlay("#screenshotOverlay", "tzCompApk", "btnTZCompApk"),
    () => initDownloadModal('#btnDownloadConfirm', '#tzCompApk .download-option[data-platform=Android]', 'tzCompApk', 'downloadConfirmModal')
];
