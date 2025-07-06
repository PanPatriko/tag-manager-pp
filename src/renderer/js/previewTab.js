import { createFilePreview } from './rightSidebar/filePreview.js';
import { setLanguageFilePrev } from './i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
    
    const savedLanguage = localStorage.getItem('language') || 'en';
    await setLanguageFilePrev(savedLanguage);

    document.title = window.translations['title-file-preview'] || 'File Preview';
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
    repeatLabel.textContent = window.translations['cntx-menu-vid-repeat']
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
    controlsLabel.textContent = window.translations['cntx-menu-vid-show-controls']
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
        await setLanguageFilePrev(event.data.language);
        document.title = window.translations['title-file-preview'] || 'File Preview';
    }
    if (event.data && event.data.type === 'update-theme' && event.data.theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(event.data.theme);
        localStorage.setItem('theme', event.data.theme);
    }

});