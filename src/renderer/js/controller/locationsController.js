
import { locationsModel } from "../model/locationsModel.js";
import { i18nModel } from "../model/i18nModel.js";

import { locationsView } from "../view/locationsView.js";

import { displayDirectory } from "./filesController.js";
import { pushToHistory } from "./historyController.js"
import { openLocationModal } from "./locationModalController.js";

let startY = 0;
let startHeight = 0;

async function onLocationClick(event) {
    const target = event.target;
    const id = parseInt(target.dataset.id);

    if (locationsView.isLocationItem(target)) {

        const location = locationsModel.findLocationById(id);

        if (!await window.api.fileExists(location.path)) {
            showPopup(i18nModel.t('dir-read-error'), 'error');
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

function onMouseMove(e) {
    const dy = e.clientY - startY;
    const newHeight = startHeight + dy;
    
    locationsView.setLocationContainerHeight(newHeight);
}

function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
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
    await locationsView.renderHierarchy(historyRecord.root);
    locationsView.expandRootDirectory();
}

export async function initLocations() {
    await locationsModel.getLocationsFromDB();
    refreshLocations();

    locationsView.onAddLocationClick(() => { openLocationModal(); });

    locationsView.onLocationContainerClick((event) => onLocationClick(event));

    locationsView.onDirectoryContainerClick((event) => onDirectoryClick(event));

    locationsView.onResizeHandleMouseDown((e) => { 
        startY = e.clientY;
        startHeight = locationsView.getLocationContainerHeight();
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}