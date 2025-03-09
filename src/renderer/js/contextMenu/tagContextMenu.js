import {tags} from "../state.js"
import { openModalNewTag, openModalEditTag } from "../modals/tagModal.js"
import { refreshTags } from "../leftSidebar/tagsPanel.js"
import { adjustPosition } from "./contextMenu.js";

window.editTag = editTag;
window.addChildTag = addChildTag;
window.confirmDeleteTag = confirmDeleteTag;

export function showTagContextMenu(x, y, tagId) {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;

    contextMenu.innerHTML = `
        <button onclick="editTag(${tagId})">${window.translations['cntx-menu-edit-tag']}</button>
        <button onclick="addChildTag(${tagId})">${window.translations['cntx-menu-add-child-tag']}</button>
        <button onclick="confirmDeleteTag(${tagId})">${window.translations['cntx-menu-del-tag']}</button>
    `;

    document.body.appendChild(contextMenu);

    adjustPosition(x, y, contextMenu);

    const closeMenu = () => contextMenu.remove();
    document.addEventListener('click', closeMenu, { once: true });
}

async function editTag(tagId) {
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
        openModalEditTag(tag);
    } else {
        console.warn('Tag not found:', tagId);
    }
}

async function addChildTag(tagId) {
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
        openModalNewTag(tag);
    } else {
        console.warn('Tag not found:', tagId);
    }
}

async function confirmDeleteTag(tagId) {
    const result = await Swal.fire({
        text: window.translations['confirm-del-tag'],
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: window.translations['ok'],
        cancelButtonText: window.translations['cancel'],
        customClass: {
            popup: 'custom-swal-popup'
        }
    });

    if (result.isConfirmed) {
        await window.api.deleteTag(tagId);
        refreshTags();
    }
}