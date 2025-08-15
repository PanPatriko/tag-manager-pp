import {locations} from "../state.js"
import { openLocationModal } from "../modals/locationModal.js"
import { refreshLocations } from "../leftSidebar/locations.js"
import { adjustPosition } from "./contextMenu.js";

import { i18nModel } from "../model/i18nModel.js";

window.editLocation = editLocation;
window.confirmDeleteLocation = confirmDeleteLocation;

export function showLocContextMenu(x, y, locId) {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;

    contextMenu.innerHTML = `
        <button onclick="editLocation(${locId})">${i18nModel.t('cntx-menu-edit-loc')}</button>
        <button onclick="confirmDeleteLocation(${locId})">${i18nModel.t('cntx-menu-del-loc')}</button>
    `;

    document.body.appendChild(contextMenu);

    adjustPosition(x, y, contextMenu);

    const closeMenu = () => contextMenu.remove();
    document.addEventListener('click', closeMenu, { once: true });
}

async function editLocation(locId) {
    const location = locations.find(l => l.id === locId);
    if (location) {
        openLocationModal(location);
    } else {
        console.warn('Location not found:', locId);
    }
}

async function confirmDeleteLocation(locId) {
    const result = await showPopup('', i18nModel.t('confirm-del-loc'), 
        'question', true);

    if (result.isConfirmed) {
        await window.api.deleteLocation(locId);
        refreshLocations()
    }
}