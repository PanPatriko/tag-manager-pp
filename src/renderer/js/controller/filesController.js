import { filesModel } from '../model/filesModel.js';
import { locationsModel } from '../model/locationsModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { filesView } from '../view/filesView.js';
import { paginationView } from '../view/paginationView.js';

import { filePreviewController } from "./filePreviewController.js"
import { historyController } from './historyController.js';
import { paginationController  } from './paginationController.js';

import { previewWindow } from "./contextMenuController.js"; // TODO later
import { thumbnailDir } from "../utils.js"

let lastSelectedIndex = null;

const path = window.api.path;

export const filesController = { 

    init() {
        filesView.init();

        filesView.onSortClick(() => {
            filesModel.setSortBy('name');
            filesModel.changeSortByNameOrder();
            filesView.updateSortByNameDirectionIndicator(filesModel.sortByNameOrder);

            filesModel.sortFiles();
            this.displayFiles();
        });

        filesView.onSortDateClick(async () => {
            filesModel.setSortBy('date');
            filesModel.changeSortByDateOrder();
            filesView.updateSortByDateDirectionIndicator(filesModel.sortByDateOrder);

            await filesModel.sortFiles();
            this.displayFiles();
        });

        filesView.onPanelClick((event) => {
            const container = filesView.getClosestFileContainer(event.target);
            if (!container) return;

            toggleSelection(container, event.ctrlKey, event.shiftKey);
            if (lastSelectedIndex !== null && (event.ctrlKey || event.shiftKey)) {
                return;
            }

            const id = container.dataset.id;
            const path = container.dataset.path;
            const current = (id && id !== 'null') ? filesModel.getFileById(id) : filesModel.getFileByPath(path);

            filesModel.currentPreviewFile = current;

            filePreviewController.renderFilePreview(current);
            filePreviewController.renderFileInfo(current);

            if (previewWindow && !previewWindow.closed) {
                previewWindow.postMessage({ type: 'update-preview', file: current }, '*');
            }
        });

        filesView.onPanelDblClick((event) => {
            const container = filesView.getClosestFileContainer(event.target);
            if (!container) return;

            const path = container.dataset.path;
            const file = filesModel.getFileByPath(path);
            if (!file || !file.isDirectory) return;

            if (path) {
                historyController.pushToHistory({ type: 'directory', path });
                this.displayDirectory(path);
            }

        });

    },

    selectAllFiles() {
        filesModel.selectCurrentPageFiles();
        filesView.selectAllFiles();
        paginationController.updateSelectedFileCount();
    },

    selectNextFile() {
        const visible = filesModel.getCurrentPageFiles();
        if (visible.length === 0) return;

        if (lastSelectedIndex === null) {
            lastSelectedIndex = 0;
        } else {
            lastSelectedIndex = (lastSelectedIndex + 1) % visible.length;
        }

        const fileToSelect = visible[lastSelectedIndex];
        selectFile(fileToSelect);
    },

    selectPreviousFile() {
        const visible = filesModel.getCurrentPageFiles();
        if (visible.length === 0) return;

        if (lastSelectedIndex === null) {
            lastSelectedIndex = visible.length - 1;
        } else {
            lastSelectedIndex = (lastSelectedIndex - 1 + visible.length) % visible.length;
        }

        const fileToSelect = visible[lastSelectedIndex];
        selectFile(fileToSelect);
    },

    async displayDirectory(dirPath) {
        const dirFiles = await window.api.getFilesInPath(dirPath);

        if (dirFiles.error) {
            console.error('displayDirectory: error', dirFiles.error);
            showPopup(dirFiles.error, 'error');
            return;
        }

        for (const file of dirFiles) {
            const foundFile = await window.api.getFileByPath(file.path);
            if (foundFile) {
                file.id = foundFile.id;
            } else {
                file.id = null;
            }
        }

        paginationView.disableParentDir(locationsModel.root === dirPath);
        paginationView.setDirectoryName(await path.basename(dirPath));

        locationsModel.currentDirectory = dirPath;
        filesModel.files = dirFiles;
        await filesModel.sortFiles();
        this.displayFiles();
    },

    async displayFiles() {
        lastSelectedIndex = null;
        filesModel.resetSelection();
        filesView.clearPanel();

        const currentFiles = filesModel.getCurrentPageFiles();
        paginationController.updateFilePages();
        paginationController.updateFileCount();

        await generateThumbnails(currentFiles);

        for (const file of currentFiles) {
            const { thumbnailSrc, fullSize, missing } = await resolveThumbnailForFile(file);
            const containerSize = settingsModel.iconSize;

            filesView.createFileElement(file, {
                thumbnailSrc,
                fullSize,
                missing,
                containerSize
            });
        };
    },
}

function toggleSelection(container, isCtrlPressed, isShiftPressed) {
    const fileContainers = filesView.findAllContainers();
    const currentIndex = fileContainers.indexOf(container);

    if (isShiftPressed && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, currentIndex);
        const end = Math.max(lastSelectedIndex, currentIndex);
        for (let i = start; i <= end; i++) {
            const id = fileContainers[i].dataset.id;
            const path = fileContainers[i].dataset.path;
            let isChecked;

            if (id != 'null') {
                isChecked = filesModel.selectFileById(id, false);
            } else {
                isChecked = filesModel.selectFileByPath(path, false);
            }

            filesView.setContainerSelected(fileContainers[i], isChecked);
        }
    } else if (isCtrlPressed) {
        const id = container.dataset.id;
        const path = container.dataset.path;
        let isChecked;

        if (id != 'null') {
            isChecked = filesModel.selectFileById(id);
        } else {
            isChecked = filesModel.selectFileByPath(path);
        }

        filesView.setContainerSelected(container, isChecked);
    } else {
        filesModel.resetSelection();
        filesView.resetSelection();

        const id = container.dataset.id;
        const path = container.dataset.path;

        if (id != 'null') {
            filesModel.selectFileById(id, false);
        } else {
            filesModel.selectFileByPath(path, false);
        }

        filesView.setContainerSelected(container, true);
    }

    lastSelectedIndex = currentIndex;
    paginationController.updateSelectedFileCount();
}

function selectFile(file) {
    filesModel.resetSelection();
    filesView.resetSelection();

    if (!file) {
        lastSelectedIndex = null;
        filesModel.currentPreviewFile = null;
        paginationController.updateSelectedFileCount();
        filePreviewController.renderFilePreview(null);
        filePreviewController.renderFileInfo(null);
        return;
    }

    let container;
    if (file.id != null) {
        filesModel.selectFileById(file.id, false);
        container = filesView.findFileContainerById(file.id);
    } else {
        filesModel.selectFileByPath(file.path, false);
        container = filesView.findFileContainerByPath(file.path);
    }

    filesModel.currentPreviewFile = file;

    filesView.setContainerSelected(container, true);
    paginationController.updateSelectedFileCount();
    filePreviewController.renderFilePreview(file);
    filePreviewController.renderFileInfo(file);

    if (previewWindow && !previewWindow.closed) {
        previewWindow.postMessage({ type: 'update-preview', file: file }, '*');
    }

    const visible = filesModel.getCurrentPageFiles();
    lastSelectedIndex = visible.findIndex(f => (f.id != null ? f.id === file.id : f.path === file.path));
}

async function getThumbnailPath(filePath) {
    const dir = await path.dirname(filePath);
    const ext = await path.extname(filePath);
    const base = await path.basename(filePath, ext);
    const thumbnailDirPath = await path.join(dir, thumbnailDir);
    const thumbnailPath = await path.join(thumbnailDirPath, `${base}${ext}.jpg`);
    return thumbnailPath;
}

async function generateThumbnails(files) {
    filesView.showLoadingBar();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.isDirectory) {
            const filePath = file.path;
            const thumbnailPath = await getThumbnailPath(filePath);

            if (!await window.api.fileExists(thumbnailPath)) {
                try {
                    const thumbnailDir = await path.dirname(thumbnailPath);
                    if (!await window.api.fileExists(thumbnailDir)) {
                        await window.api.createDirectory(thumbnailDir);
                    }
                    await window.api.generateThumbnail(filePath, thumbnailPath);
                } catch (error) {
                    console.error('generateThumbnails: error', error);
                }
            }
        }
        const progress = ((i + 1) / files.length) * 100;
        filesView.updateLoadingBar(progress);
    }
    filesView.hideLoadingBar();
}

async function resolveThumbnailForFile(file) {
    // directory
    if (file.isDirectory) {
        return { thumbnailSrc: 'images/folder-256.png', fullSize: false, missing: false };
    }

    const filePath = file.path;
    const thumbnailPath = await getThumbnailPath(filePath);

    // file missing
    if (!await window.api.fileExists(filePath)) {
        return { thumbnailSrc: 'images/cross.png', fullSize: false, missing: true };
    }

    // thumbnail missing -> generic icon
    // TODO generate only if checked in settings
    if (!await window.api.fileExists(thumbnailPath)) {
        return { thumbnailSrc: 'images/file-256.png', fullSize: false, missing: false };
    }

    // thumbnail exists
    return { thumbnailSrc: thumbnailPath, fullSize: true, missing: false };
}
