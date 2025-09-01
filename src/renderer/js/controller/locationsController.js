import { displayDirectory } from "../content/content.js"

import { pushToHistory } from "./historyController.js"
import { openLocationModal } from "./locationModalController.js";
import { locationsModel } from "../model/locationsModel.js";
import { i18nModel } from "../model/i18nModel.js";
import { locationsView } from "../view/locationsView.js";

let isResizing = false;
let startY = 0;
let startHeight = 0;

async function _onLocationClick(location, locDiv, e) {
    if (await window.api.fileExists(location.path)) {
        const dirContainer = locationsView.directoryContainer;
        dirContainer.innerHTML = '';
        await locationsView.renderHierarchy(location.path, dirContainer, _onDirectoryClick, async (path) => {
            return await window.api.getDirectoryHierarchy(path);
        });
        dirContainer.querySelector('button').click(); // expand root directory
        locationsModel.root = location.path;
        locationsModel.currentDirectory = location.path;
        locationsModel.activeLocation = location;
        pushToHistory({ type: 'directory', path: location.path });
        displayDirectory(location.path);
        locationsView.setActiveLocation(location.id);
    } else {
        showPopup('', i18nModel.t('dir-read-error'), 'error');
    }
}

function _onDirectoryClick(path, span, li, e) {
    pushToHistory({ type: 'directory', path });
    displayDirectory(path);
}

export async function refreshLocations() {
    locationsView.renderLocations(locationsModel.locations, _onLocationClick);
    if (locationsModel.activeLocation) {
        locationsView.setActiveLocation(locationsModel.activeLocation.id);
    }
}

export async function restoreLocation(historyRecord) {
    locationsModel.root = historyRecord.root;
    locationsModel.activeLocation = historyRecord.activeLocation;
    
    refreshLocations();
    locationsView.directoryContainer.innerHTML = '';
    await locationsView.renderHierarchy(historyRecord.path, locationsView.directoryContainer, _onDirectoryClick, async (path) => {
        return await window.api.getDirectoryHierarchy(path);
    });
}

export async function initLocations() {
    await locationsModel.getLocationsFromDB();
    refreshLocations();

    locationsView.addLocationButton.addEventListener('click', () => {
        openLocationModal();
    });

    locationsView.resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = locationsView.locationContainer.offsetHeight;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const dy = e.clientY - startY;
        let newHeight = startHeight + dy;
        // Optional: set min/max height
        newHeight = Math.max(40, newHeight);
        newHeight = Math.min(locationsView.locationPanel.offsetHeight - 40, newHeight);
        locationsView.locationContainer.style.height = newHeight + 'px';
        locationsView.directoryContainer.style.flex = '1 1 0';
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
        }
    });
}