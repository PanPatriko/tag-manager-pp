import { copiedTags, setCopiedTags, currentLocation, files, setFiles } from "../state.js"
import { formatString } from "../i18n.js"
import { openFileModal } from "../modals/fileTagModal.js"
import { refreshFileInfo } from "../rightSidebar/fileInfo.js"
import { displayDirectory, displayFiles, getSelectedFiles } from "../content/content.js"
import { adjustPosition } from "./contextMenu.js";

window.pasteTags = pasteTags;
window.addTagForFile = addTagForFile;
window.copyTags = copyTags;
window.openFileExt = openFileExt;
window.openFileLocation = openFileLocation;
window.deleteFile = deleteFile;

let id = null;
let path = null;

export function showFileContextMenu(x, y, fileId, filePath) {
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    id = fileId;
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
        // if(confirm(window.translations['confirm-del-file'])) {
        //     await window.api.deleteFileById(fileId);
        //     setFiles(files.filter(f => f.id !== fileId));
        //     displayFiles(files);
        // }
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
            setFiles(files.filter(f => f.id !== fileId));
            displayFiles(files);
        }
    } else {
        //alert(window.translations['cntx-menu-delete-file-no-id']);
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
    if(id == null) {
        window.api.openExt(path);
    } else {
        const file = files.find(f => f.id == id);
        window.api.openExt(file.path);
    }
}

async function openFileLocation() {
    if(id == null) {
        window.api.openExplorer(path);
    } else {
        const file = files.find(f => f.id == id);
        window.api.openExplorer(file.path);
    }
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
            //alert(window.translations['alert-file-no-tags']);
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
        //alert(window.translations['alert-fetching-tags']);
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
        //alert(window.translations['alert-no-files-selected']);
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
        //alert(window.translations['alert-no-copied-tags']);
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
    let refreshFilesPanelNeeded = false;

    for (const file of selectedFiles) {

        if (!file.id) {
            const fileName = file.path.split('\\').pop();
            await window.api.createFile({ name: fileName, path: file.path });
            const newFile = await window.api.getFileByPath(file.path);
            file.id = newFile.id;
            refreshFilesPanelNeeded = true;
        }

        for (const tag of copiedTags) {
            try {
                await window.api.addFileTag(file.id, tag.id);
            } catch (error) {
                console.warn(`Error adding tag ${tag.name} to file ${file.id}:`, error);
                conflicts.push({ fileId: file.id, tagName: tag.name });
            }
        }
    }

    if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(conflict => `File ID: ${conflict.fileId}, Tag: ${conflict.tagName}`).join('\n');
        // alert(formatString(window.translations['alert-tags-paste-problems'], {
        //     conflictMessages: conflictMessages
        // }));
        const text = formatString(window.translations['alert-tags-paste-problems'], {
                conflictMessages: conflictMessages
        })
        Swal.fire({
            html: '<pre>' + text + '</pre>',
            icon: 'info',
            confirmButtonText: 'OK',
        });
        //alert(`Tags already exist for the following files and tags:\n${conflictMessages}\nOther tags pasted successfully.`);
    } else {
        //alert(window.translations['alert-tags-paste-success']);
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
    if(refreshFilesPanelNeeded) {
        await displayDirectory(currentLocation);
    }
    setCopiedTags(null);
}