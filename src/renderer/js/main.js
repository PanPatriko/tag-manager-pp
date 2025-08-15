import { refreshTags } from './leftSidebar/tagsPanel.js'
import { refreshLocations } from './leftSidebar/locations.js';
import { showActivePanel } from './leftSidebar/leftSidebar.js';
import { restoreSidebarState } from './content/toggleSidebars.js';

import { initSettingsController } from './controller/settingsController.js';


import ('./header/searchBar.js');
import ('./contextMenu/contextMenu.js')
import ('./content/toggleSidebars.js');

document.addEventListener('DOMContentLoaded', async () => {

    initSettingsController();

    restoreSidebarState();
    showActivePanel();
    refreshTags();
    refreshLocations();
});