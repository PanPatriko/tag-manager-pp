import { refreshTags } from './leftSidebar/tagsPanel.js'
import { refreshLocations } from './leftSidebar/locations.js';
import { showActivePanel } from './leftSidebar/leftSidebar.js';
import { setIconSize, setMaxFilesPerPage, setVidAutoplay, setVidLoop, setDefTagBgColor, setDefTagTextColor } from './state.js';
import { setFilesPanelGapAndPadding } from './header/settings.js';
import { setLanguage } from './i18n.js';

import ('./header/searchBar.js');
import ('./contextMenu/contextMenu.js')
import ('./content/toggleSidebars.js');

document.addEventListener('DOMContentLoaded', async () => {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;

    const savedLanguage = localStorage.getItem('language') || 'en';
    document.getElementById('language-select').value = savedLanguage;
    setLanguage(savedLanguage);

    const iconSize = localStorage.getItem('iconSize') || '125';
    document.getElementById('icon-size').value = iconSize;
    setFilesPanelGapAndPadding(iconSize);
    setIconSize(iconSize);

    const maxFilesPerPage = localStorage.getItem('maxFilesPerPage') || '50';
    document.getElementById('max-files').value = maxFilesPerPage;
    setMaxFilesPerPage(parseInt(maxFilesPerPage));

    const vidAutoplay = localStorage.getItem('vidAutoplay') === 'true';
    document.getElementById('vid-autoplay').checked = vidAutoplay;
    setVidAutoplay(vidAutoplay);

    const vidLoop = localStorage.getItem('vidLoop') === 'true';
    document.getElementById('vid-loop').checked = vidLoop;
    setVidLoop(vidLoop);

    const defTagBgColor = localStorage.getItem('defTagBgColor') || '#61dd61';
    document.getElementById('def-tag-bgcolor').value = defTagBgColor;
    setDefTagBgColor(defTagBgColor);

    const defTagTextColor = localStorage.getItem('defTagTextColor') || '#ffffff';
    document.getElementById('def-tag-textcolor').value = defTagTextColor;
    setDefTagTextColor(defTagTextColor);

    showActivePanel();
    refreshTags();
    refreshLocations();
});