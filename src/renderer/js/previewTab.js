import { createFilePreview } from './rightSidebar/filePreview.js';

import { settingsModel } from './model/settingsModel.js';
import { settingsView } from './view/settingsView.js';
import { i18nModel } from './model/i18nModel.js';
import { i18nView } from './view/i18nView.js';

document.addEventListener('DOMContentLoaded', async () => {
    settingsView.documentTheme = settingsModel.theme;
    
    i18nView.applyTranslations(settingsModel.language);
    document.title = i18nModel.t('title-file-preview') || 'File Preview';
});

document.addEventListener('contextmenu', (event) => {
    const clickedVid = event.target.closest('.file-preview-video');
    if (clickedVid) {
        event.preventDefault();
        showVidContextMenu(event.pageX, event.pageY);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        // Send a message to the main window
        if (window.opener) {
            window.opener.postMessage({
                type: 'preview-arrow',
                key: event.key
            }, '*');
        }
    }
});

function showVidContextMenu(x, y) {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;

    let vid = document.querySelector('#file-preview > *');

    const repeatContainer = document.createElement('div');
    repeatContainer.className = 'checkbox-container';

    const repeatCheckbox = document.createElement('input');
    repeatCheckbox.type = 'checkbox';
    repeatCheckbox.checked = vid.loop;
    repeatCheckbox.id = 'repeatCheckbox';

    repeatCheckbox.onchange = (event) => {
        vid.loop = event.target.checked;
    };

    const repeatLabel = document.createElement('label');
    repeatLabel.textContent = i18nModel.t('cntx-menu-vid-repeat')
    repeatLabel.htmlFor = 'repeatCheckbox';

    repeatContainer.appendChild(repeatLabel);
    repeatContainer.appendChild(repeatCheckbox);


    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'checkbox-container';

    const controlsCheckbox = document.createElement('input');
    controlsCheckbox.type = 'checkbox';
    controlsCheckbox.checked = vid.controls;
    controlsCheckbox.id = 'controlsCheckbox';

    controlsCheckbox.onchange = (event) => {
        vid.controls = event.target.checked;
    };

    const controlsLabel = document.createElement('label');
    controlsLabel.textContent = i18nModel.t('cntx-menu-vid-show-controls')
    controlsLabel.htmlFor = 'controlsCheckbox';
    
    controlsContainer.appendChild(controlsLabel);
    controlsContainer.appendChild(controlsCheckbox);

    contextMenu.appendChild(repeatContainer);
    contextMenu.appendChild(controlsContainer);

    document.body.appendChild(contextMenu);

    const closeMenu = (event) => {
        if (event.target.id === 'repeatCheckbox' || event.target.id === 'controlsCheckbox') {
            return;
        }
        contextMenu.remove();
    };

    document.addEventListener('click', closeMenu, { once: true });
}

// Helper to get file path from query string
function getFileFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const path = params.get('file');
    if (!path) return null;
    return { path };
}

// Initial preview (from query string)
const file = getFileFromQuery();
if (file) {
    createFilePreview(file);
}

// Listen for updates from the main window
window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'update-preview' && event.data.file) {
        createFilePreview(event.data.file);
    }
    if (event.data && event.data.type === 'update-lang' && event.data.language) {
        i18nView.applyTranslations(event.data.language);
        document.title = i18nModel.t('title-file-preview') || 'File Preview';
    }
    if (event.data && event.data.type === 'update-theme' && event.data.theme) {
        settingsView.documentTheme = event.data.theme;
    }

});