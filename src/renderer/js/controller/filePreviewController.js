import { settingsModel } from '../model/settingsModel.js';
import { i18nModel } from '../model/i18nModel.js';
import { filesModel } from '../model/filesModel.js';
import { fileTagsModel } from '../model/fileTagsModel.js';
import { tagsModel, TagType } from '../model/tagsModel.js';

import { filePreviewView } from '../view/filePreviewView.js';
import { tagsView, TagClass } from '../view/tagsView.js';

import { filesController } from './filesController.js';

let currentDetach = null;
let isResizing = false;
let isMouseOverSaveButton = false;
let fileExists = null;

export const  filePreviewController = {

    init() {
        filePreviewView.init();

        filePreviewView.onResizeStart(() => {
            isResizing = true;
            filePreviewView.setBodyCursor('ew-resize');
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        filePreviewView.onFileNameSaveMouseEnter(() => {
            isMouseOverSaveButton = true;
        });

        filePreviewView.onFileNameSaveMouseLeave(() => {
            isMouseOverSaveButton = false;
        });

        filePreviewView.onFileNameSaveClick(() => {
            handleFileNameSave();
        });

        filePreviewView.onFileNameInputFocus(() => {
            if (!fileExists) return;
            filePreviewView.showFileNameSaveButton();
        });

        filePreviewView.onFileNameInputFocusOut(() => {
            if (isMouseOverSaveButton) return;
            filePreviewView.hideFileNameSaveButton();        
        });

        filePreviewView.onShowInfoClick(() => {
            filePreviewView.toggleFileInfoSection();
        });

        filePreviewView.onShowTagsClick(() => {
            filePreviewView.toggleFileTagsSection();
        });

        filePreviewView.onShowPreviewClick(() => {
            filePreviewView.toggleFilePreviewSection();
        });
    },

    async renderFileInfo(file) {
        // reset tag area
        filePreviewView.clearTags();

        // no file -> clear fields and preview
        if (!file) {
            filePreviewView.clearFileInfo();
            filePreviewView.clearPreview();
            return;
        }

        if (!file.size || !file.createdAt) {
            await window.api.getFileInfo(file.path).then((fileInfo) => {
                if (fileInfo) {
                    file.size = fileInfo.size;
                    file.createdAt = fileInfo.createdAt;
                }
            }).catch((err) => {
                console.error('renderFileInfo: getFileInfo error', err);
            });
        }

        filePreviewView.setFileInfo(file);

        try {
            const tags = await fileTagsModel.getFileTags(file.id);
            if (!tags || tags.length === 0) {
                return;
            }

            const completeTags = tagsModel.addMissingParentTags(tags);
            const tagHierarchy = tagsModel.buildTagHierarchy(completeTags);

            tagsView.renderTagTree({
                container: tagsView.getFileTagsContainer(),
                tagHierarchy,
                tagClass: TagClass.FILE_TAG_ITEM,
                childrenInitiallyVisible: false
            });

            tagsView.applyExpandedTags(tagsModel.getExpandedTags(TagType.EXPANDED_FILE_TAGS), TagClass.FILE_TAG_ITEM);

        } catch (err) {
            console.error('renderFileInfo: failed to load tags', err);
        }
    },

    async renderFilePreview(file) {
        // detach previous listeners
        if (typeof currentDetach === 'function') {
            currentDetach();
            currentDetach = null;
        }

        filePreviewView.clearPreview();

        if (!file || !file.path) {
            // nothing to render
            fileExists = false;
            return;
        }

        if (!await window.api.fileExists(file.path)) {
            filePreviewView.setError('content-deleted-file', i18nModel.t('content-deleted-file'));
            fileExists = false;
            return;
        }

        fileExists = true;

        const imgRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
        const vidRegex = /\.(mp4|webm|ogg)$/i;

        try {
            let el = null;
            if (imgRegex.test(file.path)) {
                el = filePreviewView.renderImage(file);
            } else if (vidRegex.test(file.path)) {
                el = filePreviewView.renderVideo(file, settingsModel);
            } else {
                filePreviewView.setError('file-prev-format-error', i18nModel.t('file-prev-format-error'));
                return;
            }

            // attach interactions and keep a detach function
            currentDetach = attachInteractions(el);
        } catch (err) {
            console.error('renderFilePreview error', err);
            filePreviewView.setError('file-prev-format-error', i18nModel.t('file-prev-format-error'));
        }
    }
};

function attachInteractions(element) {
    let scale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialX = 0, initialY = 0;

    // For consistent removal we declare handlers as named functions
    const onWheel = (e) => {
        e.preventDefault();
        scale += (e.deltaY < 0) ? 0.1 : -0.1;
        if (scale < 0.1) scale = 0.1;
        filePreviewView.setTransform(element, scale);
    };

    const onDblClick = () => {
        scale = 1;
        filePreviewView.setTransform(element, scale);
        filePreviewView.resetPosition(element);
    };

    const onMouseDown = (e) => {
        // only left button
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        // offsetLeft/Top are relative to offsetParent (preview)
        initialX = element.offsetLeft;
        initialY = element.offsetTop;
        element.style.cursor = 'grabbing';
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        filePreviewView.setPosition(element, initialX + dx, initialY + dy);
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        element.style.cursor = 'grab';
    };

    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('dblclick', onDblClick);
    element.addEventListener('mousedown', onMouseDown);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Return a detach function to remove handlers when preview changes
    return function detach() {
        element.removeEventListener('wheel', onWheel);
        element.removeEventListener('dblclick', onDblClick);
        element.removeEventListener('mousedown', onMouseDown);

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
}

function onMouseMove(e) {
    if (!isResizing) return;

    const containerRect = filePreviewView.getTagsTreeParentRect();
    let newWidth = e.clientX - containerRect.left;
    filePreviewView.setTagsTreeWidth(newWidth);
}

function onMouseUp() {
    if (!isResizing) return;

    isResizing = false;
    filePreviewView.setBodyCursor('');

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

async function handleFileNameSave() {
    const current = filesModel.currentPreviewFile;
    if (!current) return;

    const newFileName = filePreviewView.getFileNameValue().trim();
    const fileId = current.id;
    const oldFilePath = current.path;

    try {
        // choose API once
        const result = (fileId != null)
            ? await window.api.updateFile(fileId, newFileName, oldFilePath)
            : await window.api.updateFileNotDB(newFileName, oldFilePath);

        if (!result || !result.success) {
            const errMsg = result?.error ?? 'Unknown';
            showPopup(i18nModel.t('file-prev-name-save-error') + errMsg, 'error');
            return;
        }

        // apply success changes
        const newPath = result.newFilePath ?? oldFilePath;
        filePreviewView.setFilePathValue(newPath);
        filePreviewView.hideFileNameSaveButton();

        // update in-memory filesModel entry if present
        let fileEntry = null;
        if (fileId != null) {
            fileEntry = filesModel.getFileById(fileId);
        } else {
            // match by original path/name to be safer
            fileEntry = filesModel.getFileByPath(oldFilePath);
        }
        if (fileEntry) {
            fileEntry.name = newFileName;
            fileEntry.path = newPath;
        }

        // refresh preview info and file list UI
        filesController.displayFiles();
    } catch (err) {
        showPopup(i18nModel.t('file-prev-name-save-error') + err, 'error');
    }
}