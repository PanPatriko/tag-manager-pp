import { tagsModel } from "../model/tagsModel.js";
import { locationsModel } from '../model/locationsModel.js';
import { i18nModel } from '../model/i18nModel.js';
import { filesModel } from "../model/filesModel.js";

import { contextMenuView } from '../view/contextMenuView.js';

import { refreshTagsContainer } from "./tagsController.js";
import { openNewTagModal, openEditTagModal } from "./tagsModalController.js";
import { refreshLocations } from "./locationsController.js";
import { openLocationModal } from "./locationModalController.js"

import { copiedTags, setCopiedTags, currentFile, setCurrentFileId } from "../state.js"
import { formatString } from "../utils.js"
import { openFileModal } from "../modals/fileTagModal.js"
import { refreshFileInfo } from "../rightSidebar/fileInfo.js"
import { updateSelectedFileCount } from "../content/filesInfo.js";
import { getSelectedFiles } from "../content/content.js"

window.editTag = _editTag;
window.addChildTag = _addChildTag;
window.confirmDeleteTag = _confirmDeleteTag;
window.confirmDeleteFileTag = _confirmDeleteFileTag;

window.addTagFile = _addTagFile;
window.copyTags = copyTags;
window.pasteTags = pasteTags;
window.openFileNewTab = openFileNewTab
window.openFileExt = _openFileExt;
window.openFileLocation = _openFileLocation;
window.confirmDeleteFile = _confirmDeleteFile;

window.editLocation = _editLocation;
window.confirmDeleteLocation = _confirmDeleteLocation;

export let previewWindow = null;

async function _editTag(tagId) {
    const tag = tagsModel.tags.find(t => t.id === tagId);
    if (tag) {
        openEditTagModal(tag);
    } else {
        console.warn('Tag not found:', tagId);
    }
}

async function _addChildTag(tagId) {
    const tag = tagsModel.tags.find(t => t.id === tagId);
    console.log(tag);
    if (tag) {
        openNewTagModal(tag);
    } else {
        console.warn('Tag not found:', tagId);
    }
}

async function _confirmDeleteTag(tagId) {
    const result = await showPopup('', i18nModel.t('confirm-del-tag'), 
        'question', true);

    if (result.isConfirmed) {
        await tagsModel.deleteTag(tagId);
        refreshTagsContainer();
    }
}

async function _addTagFile() {
    openFileModal();
}

export async function copyTags(fileId) {
    try {
        const tags = await window.api.getFileTags(fileId);
        if (tags.length > 0) {
            setCopiedTags(tags);
        } else {
            showPopup('', i18nModel.t('alert-file-no-tags'), 'warning');       
        }
    } catch (error) {
        console.error('Error fetching tags:', error);
        showPopup('', i18nModel.t('alert-fetching-tags'), 'warning');
    }
}

export async function pasteTags() {
    const selectedFiles = getSelectedFiles();
    if (selectedFiles.length === 0) {
        showPopup('', i18nModel.t('alert-no-files-selected'), 'warning');
        return;
    }
    if (copiedTags === null) {
        showPopup('', i18nModel.t('alert-no-copied-tags'), 'warning');
        return;
    }

    const conflicts = [];

    for (const file of selectedFiles) {
        let fileId = file.dataset.id;
        let filePath = file.dataset.path;

        if (fileId === 'null') {
            const fileName = filePath.split('\\').pop();
            await window.api.createFile({ name: fileName, path: filePath});
            const newFile = await window.api.getFileByPath(filePath);
            fileId = newFile.id;
            file.dataset.id = fileId;
            filesModel.files.find(f => f.path === filePath).id = fileId;
        }

        for (const tag of copiedTags) {
            try {
                await window.api.addFileTag(fileId, tag.id);
            } catch (error) {
                console.warn(`Error adding tag ${tag.name} to file ${fileId}:`, error);
                conflicts.push({ fileId: fileId, tagName: tag.name });
            }
        }
    }

    if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(conflict => `File ID: ${conflict.fileId}, Tag: ${conflict.tagName}`).join('\n');
        const text = formatString(i18nModel.t('alert-tags-paste-problems'), {
                conflictMessages: conflictMessages
        })
        Swal.fire({
            html: '<pre>' + text + '</pre>',
            icon: 'info',
            confirmButtonText: 'OK',
        });
    } else {
        showPopup('', i18nModel.t('alert-tags-paste-success'), 'success');
    }

    await refreshFileInfo();
    setCopiedTags(null);
}

async function _confirmDeleteFile(fileId) {
    if(fileId) {
        const result = await showPopup('', i18nModel.t('confirm-del-file'), 
            'question', true);
    
        if (result.isConfirmed) {
            await window.api.deleteFileById(fileId);
            filesModel.files.filter(f => f.id !== fileId);
            if (fileId === currentFile.id) {
                setCurrentFileId(null);
            }
            refreshFileInfo();
        }
    } else {
        showPopup(i18nModel.t('cntx-menu-delete-file-no-id-title'), 
            i18nModel.t('cntx-menu-delete-file-no-id'), 'warning');
    }    
}

async function _openFileExt(path) {
    window.api.openExt(path);
}

async function _openFileLocation(path) {
    window.api.openExplorer(path);
}

export function openFileNewTab() {
    if (!currentFile || !currentFile.path) return;

    const fileUrl = `preview.html?file=${encodeURIComponent(currentFile.path)}`;

    // Open or reuse the preview tab
    if (previewWindow && !previewWindow.closed) {
        previewWindow.focus();
        // Send updated file info
        previewWindow.postMessage({ type: 'update-preview', file: currentFile }, '*');
    } else {
        previewWindow = window.open(fileUrl, 'filePreviewTab');
    }
}

async function _confirmDeleteFileTag(tagId) {
    const result = await showPopup('', i18nModel.t('confirm-del-tag'), 
        'question', true);

    if (result.isConfirmed) {
        await window.api.deleteFileTag(currentFile.id, tagId);
        refreshFileInfo();
    }
}

async function _editLocation(locId) {
    const location = locationsModel.locations.find(l => l.id === locId);
    if (location) {
        openLocationModal(location);
    } else {
        console.warn('Location not found:', locId);
    }
}

async function _confirmDeleteLocation(locId) {
    const result = await showPopup('', i18nModel.t('confirm-del-loc'), 
        'question', true);

    if (result.isConfirmed) {
        await locationsModel.deleteLocation(locId);
        refreshLocations()
    }
}

function _repeatCheckboxOnChange (event) {
    const vid = document.querySelector('#file-preview > *');
    vid.loop = event.target.checked;
}

function _controlsCheckboxOnChange (event) {
    const vid = document.querySelector('#file-preview > *');
    vid.controls = event.target.checked;
}

export function initContextMenu() {
    document.addEventListener('contextmenu', (event) => {
        const target = event.target;
        const id = parseInt(target.dataset.id);
        let items = [];

        if (target.closest('.tag-item')) {
            items = [
                { type: 'button', label: i18nModel.t('cntx-menu-edit-tag'), onClick: () => _editTag(id) },
                { type: 'button', label: i18nModel.t('cntx-menu-add-child-tag'), onClick: () => _addChildTag(id) },
                { type: 'button', label: i18nModel.t('cntx-menu-del-tag'), onClick: () => _confirmDeleteTag(id) }
            ];
        }

        if (target.closest('.file-tag-item')) {
            items = [
                { type: 'button', label: i18nModel.t('cntx-menu-edit-tag'), onClick: () => _editTag(id) },
                { type: 'button', label: i18nModel.t('cntx-menu-del-file-tag'), onClick: () => _confirmDeleteFileTag(id) }
            ];
        }

        if (target.closest('.loc-item')) {
            items = [
                { type: 'button', label: i18nModel.t('cntx-menu-edit-loc'), onClick: () => _editLocation(id) },
                { type: 'button', label: i18nModel.t('cntx-menu-del-loc'), onClick: () => _confirmDeleteLocation(id) }
            ];
        }
        
        const fileContainer = event.target.closest('.file-container');
        if (fileContainer) {
            fileContainer.setAttribute('data-checked', true);
            updateSelectedFileCount();
            const fileId = fileContainer.dataset.id;
            const filePath = fileContainer.dataset.path;
            items = [
                { type: 'button', label: i18nModel.t('cntx-menu-edit-file-tags'), onClick: () => _addTagFile() },
                { type: 'button', label: i18nModel.t('cntx-menu-copy-tags'), onClick: () => copyTags(fileId) },
                { type: 'button', label: i18nModel.t('cntx-menu-paste-tags'), onClick: () => pasteTags() },
                { type: 'button', label: i18nModel.t('cntx-menu-open-tab'), onClick: () => openFileNewTab() },
                { type: 'button', label: i18nModel.t('cntx-menu-open-ext'), onClick: () => _openFileExt(filePath) },
                { type: 'button', label: i18nModel.t('cntx-menu-open-file-explorer'), onClick: () => _openFileLocation(filePath) },
                { type: 'button', label: i18nModel.t('cntx-menu-delete-file'), onClick: () => _confirmDeleteFile(fileId) }
            ];
        }

        if (target.closest('.file-preview-image')) {
            items = [
                { type: 'button', label: i18nModel.t('cntx-menu-open-tab'), onClick: () => openFileNewTab() },
                { type: 'button', label: i18nModel.t('cntx-menu-open-ext'), onClick: () => _openFileExt(currentFile.path) },
                { type: 'button', label: i18nModel.t('cntx-menu-open-file-explorer'), onClick: () => _openFileLocation(currentFile.path) },
            ];
        }

        if (target.closest('.file-preview-video')) {
            const vid = document.querySelector('#file-preview > *');
            items = [
                { type: 'button', label: i18nModel.t('cntx-menu-open-tab'), onClick: () => openFileNewTab() },
                { type: 'button', label: i18nModel.t('cntx-menu-open-ext'), onClick: () => _openFileExt(currentFile.path) },
                { type: 'button', label: i18nModel.t('cntx-menu-open-file-explorer'), onClick: () => _openFileLocation(currentFile.path) },
                { type: 'checkbox', label: i18nModel.t('cntx-menu-vid-repeat'), checked: vid.loop, onchange: _repeatCheckboxOnChange },
                { type: 'checkbox', label: i18nModel.t('cntx-menu-vid-show-controls'), checked: vid.controls, onchange: _controlsCheckboxOnChange }
            ];
        }

        if (items.length > 0) {
            event.preventDefault();
            contextMenuView.showMenu(event.pageX, event.pageY, items);
        }
    });
    
    document.addEventListener('click', contextMenuView.hideMenu);
}