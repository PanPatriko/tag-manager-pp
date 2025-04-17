import { copiedTags, setCopiedTags, currentLocation, files, setFiles } from "../state.js"
import { formatString } from "../i18n.js"
import { openFileModal } from "../modals/fileTagModal.js"
import { createFileInfo, refreshFileInfo } from "../rightSidebar/fileInfo.js"
import { displayDirectory, displayFiles, getSelectedFiles } from "../content/content.js"
import { adjustPosition } from "./contextMenu.js";

window.pasteTags = pasteTags;
window.addTagForFile = addTagForFile;
window.copyTags = copyTags;
window.openFileExt = openFileExt;
window.openFileLocation = openFileLocation;
window.deleteFile = deleteFile;

let path = null;

export function showFileContextMenu(x, y, fileId, filePath) {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    path = filePath;

    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;

    contextMenu.innerHTML = `
        <button onclick="addTagForFile()">${window.translations['cntx-menu-edit-file-tags']}</button>
        <button onclick="copyTags(${fileId})">${window.translations['cntx-menu-copy-tags']}</button>
        <button onclick="pasteTags()">${window.translations['cntx-menu-paste-tags']}</button>
        <button onclick="openFileExt()">${window.translations['cntx-menu-open-ext']}</button>
        <button onclick="openFileLocation()">${window.translations['cntx-menu-open-file-explorer']}</button>
        <button onclick="deleteFile(${fileId})">${window.translations['cntx-menu-delete-file']}</button>
    `;

    document.body.appendChild(contextMenu);

    adjustPosition(x, y, contextMenu);

    const closeMenu = () => contextMenu.remove();
    document.addEventListener('click', closeMenu, { once: true });
}

async function deleteFile(fileId) {
    if(fileId) {
        const result = await Swal.fire({
            text: window.translations['confirm-del-file'],
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: window.translations['ok'],
            cancelButtonText: window.translations['cancel'],
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
    
        if (result.isConfirmed) {
            await window.api.deleteFileById(fileId);
            if(currentLocation) {
                await displayDirectory(currentLocation);
                refreshFileInfo();
            } else {
                setFiles(files.filter(f => f.id !== fileId));
                displayFiles();
                createFileInfo(null);
            }
        }
    } else {
        Swal.fire({
            title: window.translations['cntx-menu-delete-file-no-id-title'],
            text: window.translations['cntx-menu-delete-file-no-id'],
            icon: 'warning',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
    }    
}

async function openFileExt() {
    window.api.openExt(path);
}

async function openFileLocation() {
    window.api.openExplorer(path);
}

async function addTagForFile() {
    openFileModal();
}

export async function copyTags(fileId) {
    try {
        const tags = await window.api.getFileTags(fileId);
        if (tags.length > 0) {
            setCopiedTags(tags);
        } else {
            Swal.fire({
                text: window.translations['alert-file-no-tags'],
                icon: 'warning',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'custom-swal-popup'
                }
            });
            
        }
    } catch (error) {
        console.error('Error fetching tags:', error);
        Swal.fire({
            text: window.translations['alert-fetching-tags'],
            icon: 'warning',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
    }
}

export async function pasteTags() {
    const selectedFiles = getSelectedFiles();
    if (selectedFiles.length === 0) {
        Swal.fire({
            text: window.translations['alert-no-files-selected'],
            icon: 'warning',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
        return;
    }
    if (copiedTags === null) {
        Swal.fire({
            text: window.translations['alert-no-copied-tags'],
            icon: 'warning',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
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
            files.find(f => f.path === filePath).id = fileId;
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
        const text = formatString(window.translations['alert-tags-paste-problems'], {
                conflictMessages: conflictMessages
        })
        Swal.fire({
            html: '<pre>' + text + '</pre>',
            icon: 'info',
            confirmButtonText: 'OK',
        });
    } else {
        Swal.fire({
            text: window.translations['alert-tags-paste-success'],
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
    }

    await refreshFileInfo();
    setCopiedTags(null);
}