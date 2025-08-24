import { adjustPosition } from "./contextMenu.js";

import { refreshTagsContainer } from "../controller/tagsController.js";
import { openNewTagModal, openEditTagModal } from "../controller/tagsModalController.js";
import { tagsView } from "../view/tagsView.js";
import { tagsModel, TagType, TagClass } from "../model/tagsModel.js";
import { i18nModel } from "../model/i18nModel.js";

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
        <button onclick="editTag(${tagId})">${i18nModel.t('cntx-menu-edit-tag')}</button>
        <button onclick="addChildTag(${tagId})">${i18nModel.t('cntx-menu-add-child-tag')}</button>
        <button onclick="confirmDeleteTag(${tagId})">${i18nModel.t('cntx-menu-del-tag')}</button>
    `;

    document.body.appendChild(contextMenu);

    adjustPosition(x, y, contextMenu);

    const closeMenu = () => contextMenu.remove();
    document.addEventListener('click', closeMenu, { once: true });
}

async function editTag(tagId) {
    const tag = tagsModel.tags.find(t => t.id === tagId);
    if (tag) {
        openEditTagModal(tag);
    } else {
        console.warn('Tag not found:', tagId);
    }
}

async function addChildTag(tagId) {
    const tag = tagsModel.tags.find(t => t.id === tagId);
    console.log(tag);
    if (tag) {
        openNewTagModal(tag);
    } else {
        console.warn('Tag not found:', tagId);
    }
}

async function confirmDeleteTag(tagId) {
    const result = await showPopup('', i18nModel.t('confirm-del-tag'), 
        'question', true);

    if (result.isConfirmed) {
        await tagsModel.deleteTag(tagId);
        refreshTagsContainer();
    }
}