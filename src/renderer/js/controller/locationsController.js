import { displayDirectory } from "../content/content.js"

import { pushToHistory } from "./historyController.js"
import { openLocationModal } from "./locationModalController.js";
import { locationsModel } from "../model/locationsModel.js";
import { i18nModel } from "../model/i18nModel.js";
import { locationsView } from "../view/locationsView.js";

let isResizing = false;
let startY = 0;
let startHeight = 0;

async function onLocationClick(event) {
    const target = event.target;
    const id = parseInt(target.dataset.id);

    if (locationsView.isLocationItem(target)) {

        const location = locationsModel.findLocationById(id);

        if (!await window.api.fileExists(location.path)) {
            showPopup('', i18nModel.t('dir-read-error'), 'error');
            return;
        }

        await locationsView.renderHierarchy(location.path);
        locationsView.expandRootDirectory();
        locationsView.setActiveLocation(location.id);

        locationsModel.root = location.path;
        locationsModel.currentDirectory = location.path;
        locationsModel.activeLocation = location;

        pushToHistory({ type: 'directory', path: location.path });
        displayDirectory(location.path);      
    }
}

async function onDirectoryClick(event) { 
    const target = event.target;
    
    if (locationsView.isExpandButton(target)) {
        const directoryHierarchy = await window.api.getDirectoryHierarchy(target.path);
        locationsView.expandButtonClick(target, directoryHierarchy);
    }
    if (locationsView.isDirectorySpan(target)) { 
        const path = target.path;
        pushToHistory({ type: 'directory', path });
        displayDirectory(path);
    } 
}

export async function refreshLocations() {
    locationsView.renderLocations(locationsModel.locations);
    if (locationsModel.activeLocation) {
        locationsView.setActiveLocation(locationsModel.activeLocation.id);
    }
}

export async function restoreLocation(historyRecord) {
    locationsModel.root = historyRecord.root;
    locationsModel.activeLocation = historyRecord.activeLocation;

    refreshLocations();
    await locationsView.renderHierarchy(historyRecord.path);
}

export async function initLocations() {
    await locationsModel.getLocationsFromDB();
    refreshLocations();

    locationsView.onAddLocationClick(() => { openLocationModal(); });

    locationsView.onLocationContainerClick((event) => onLocationClick(event));

    locationsView.onDirectoryContainerClick((event) => onDirectoryClick(event));

    locationsView.resizeHandle.addEventListener('mousedown', (e) => { // TODO refactor resize handlerów
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