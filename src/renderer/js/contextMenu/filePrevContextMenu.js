import { currentFile } from "../state.js";
import { adjustPosition } from "./contextMenu.js";

window.openFileExtPrev = openFileExtPrev

export function showImgContextMenu(x, y) {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;

    contextMenu.innerHTML = `
        <button onclick="openFileExtPrev()">${window.translations['cntx-menu-open-ext']}</button>
    `;

    document.body.appendChild(contextMenu);

    adjustPosition(x, y, contextMenu);

    const closeMenu = () => contextMenu.remove();
    document.addEventListener('click', closeMenu, { once: true });
}

export function showVidContextMenu(x, y) {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;

    let vid = document.querySelector('#file-preview > *'); 

    const openFileButton = document.createElement('button');
    openFileButton.textContent = window.translations['cntx-menu-open-ext'];
    openFileButton.onclick = openFileExt;

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


    contextMenu.appendChild(openFileButton);
    contextMenu.appendChild(repeatContainer);
    contextMenu.appendChild(controlsContainer);

    document.body.appendChild(contextMenu);

    adjustPosition(x, y, contextMenu);

    const closeMenu = (event) => {
        if (event.target.id === 'repeatCheckbox' || event.target.id === 'controlsCheckbox') {
            return;
        }
        contextMenu.remove();
    };

    document.addEventListener('click', closeMenu, { once: true });
}

async function openFileExtPrev() {
    window.api.openExt(currentFile.path);
}