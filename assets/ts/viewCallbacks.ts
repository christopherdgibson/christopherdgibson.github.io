import home from './views/home.js';
import about from './views/about.js';
import work from './views/work.js';
import articles from './views/articles.js';
// Work sub-menu
import reportDownloadHub from './views/report-download-hub.js';
import adminDocRepo from './views/admin-doc-repo.js';
import TZComp from './views/react-native-tzcomp.js';
import wordPress from './views/wordpress-plugins.js';
import personalSite from './views/personal-site-page.js';
// Articles sub-menu
import buildingARouter from './views/articles/building-a-router.js';

import type { ViewCallbackProps } from './types.js';

export const viewCallbacks: ViewCallbackProps = {
    home,
    about,
    work,
    articles,
    "report-download-hub": reportDownloadHub,
    "admin-doc-repo": adminDocRepo,
    "react-native-tzcomp": TZComp,
    "wordpress-plugins": wordPress,
    "personal-site-page": personalSite,
    "articles/building-a-router": buildingARouter
};