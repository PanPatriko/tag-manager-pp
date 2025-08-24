import { refreshLocations } from './leftSidebar/locations.js';
import { showActivePanel } from './leftSidebar/leftSidebar.js';
import { restoreSidebarState } from './content/toggleSidebars.js';

import { initSettingsController } from './controller/settingsController.js';
import { initTagsController } from './controller/tagsController.js';
import { initTagsModalController } from './controller/tagsModalController.js';

import ('./header/searchBar.js');
import ('./contextMenu/contextMenu.js')
import ('./content/toggleSidebars.js');

document.addEventListener('DOMContentLoaded', async () => {

    initTagsModalController();
    await initSettingsController();
    await initTagsController();
    
    restoreSidebarState();
    showActivePanel();
    refreshLocations();
});