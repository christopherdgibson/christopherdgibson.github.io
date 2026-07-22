import home from './views/home.js';
import work from './views/work.js';
import about from './views/about.js';
// Work sub-menu
import NYCDashboard from './views/nyc-dashboard.js';
import reportDownloadHub from './views/report-download-hub.js';
import adminDocRepo from './views/admin-doc-repo.js';
import TZComp from './views/react-native-tzcomp.js';
import wordPress from './views/wordpress-plugins.js';
import personalSite from './views/personal-site-page.js';

import type { ViewCallbackProps } from './types.js';

export const viewCallbacks: ViewCallbackProps = {
    home,
    work,
    about,
    "nyc-dashboard": NYCDashboard,
    "report-download-hub": reportDownloadHub,
    "admin-doc-repo": adminDocRepo,
    "react-native-tzcomp": TZComp,
    "wordpress-plugins": wordPress,
    "personal-site-page": personalSite
};