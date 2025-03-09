import {locations} from "../state.js"
import { openLocationModal } from "../modals/locationModal.js"
import { refreshLocations } from "../leftSidebar/locations.js"
import { adjustPosition } from "./contextMenu.js";

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
        <button onclick="editLocation(${locId})">${window.translations['cntx-menu-edit-loc']}</button>
        <button onclick="confirmDeleteLocation(${locId})">${window.translations['cntx-menu-del-loc']}</button>
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
    // if (confirm(window.translations['confirm-del-loc'])) {
    //     await window.api.deleteLocation(locId);
    //     refreshLocations()
    // }
    const result = await Swal.fire({
        text: window.translations['confirm-del-loc'],
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: window.translations['ok'],
        cancelButtonText: window.translations['cancel'],
        customClass: {
            popup: 'custom-swal-popup'
        }
    });

    if (result.isConfirmed) {
        await window.api.deleteLocation(locId);
        refreshLocations()
    }
}