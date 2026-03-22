import { filesModel } from '../model/filesModel.js';
import { locationsModel } from '../model/locationsModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { filesView } from '../view/filesView.js';
import { paginationView } from '../view/paginationView.js';

import { filePreviewController } from "./filePreviewController.js"
import { historyController } from './historyController.js';
import { paginationController  } from './paginationController.js';
import { previewTabController } from './previewTabController.js';

let lastSelectedIndex = null;
let displayAbortController = null;
let thumbnailCache = new Map();

const path = window.api.path;

export const filesController = {
    
    abortDisplay() {
        if (displayAbortController) {
            displayAbortController.abort();
        }
    },

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

        filesView.onPanelClick(async (event) => {
            const container = filesView.getClosestFileContainer(event.target);
            if (!container) return;

            toggleSelection(container, event.ctrlKey, event.shiftKey);
            if (lastSelectedIndex !== null && (event.ctrlKey || event.shiftKey)) {
                return;
            }

            const path = container.dataset.path;
            const current = filesModel.getFileByPath(path);

            filesModel.currentPreviewFile = current;
   
            await filePreviewController.renderFileInfo(current);
            await filePreviewController.renderFilePreview(current);

            previewTabController.sendPostMessage('update-preview', { file: current });
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

    async selectNextFile() {
        const visible = filesModel.getCurrentPageFiles();
        if (visible.length === 0) return;

        if (lastSelectedIndex === null) {
            lastSelectedIndex = 0;
        } else {
            lastSelectedIndex = (lastSelectedIndex + 1) % visible.length;
        }

        const fileToSelect = visible[lastSelectedIndex];
        await selectFile(fileToSelect);
    },

    async selectPreviousFile() {
        const visible = filesModel.getCurrentPageFiles();
        if (visible.length === 0) return;

        if (lastSelectedIndex === null) {
            lastSelectedIndex = visible.length - 1;
        } else {
            lastSelectedIndex = (lastSelectedIndex - 1 + visible.length) % visible.length;
        }

        const fileToSelect = visible[lastSelectedIndex];
        await selectFile(fileToSelect);
    },

    async displayDirectory(dirPath) {
        this.abortDisplay();

        filesView.showLoadingBar();

        const unsubscribe = window.api.on('getFiles:progress', async (data) => {
            filesView.updateLoadingBar(data.progress);
        });
    
        window.api.on('getFiles:complete', (data) => {
            unsubscribe();
            filesView.hideLoadingBar();
        });
        
        const dirFiles = await window.api.getFilesInPath(dirPath);

        if (dirFiles.error) {
            console.error('displayDirectory: error', dirFiles.error);
            showPopup(dirFiles.error, 'error');
            return;
        }

        paginationView.disableParentDir(locationsModel.root === dirPath);
        paginationView.setDirectoryName(await path.basename(dirPath));

        locationsModel.currentDirectory = dirPath;
        filesModel.files = dirFiles;
        await filesModel.sortFiles();
        await this.displayFiles();
    },

    async displayFiles() {
        this.abortDisplay();
        
        displayAbortController = new AbortController();
        const signal = displayAbortController.signal;

        lastSelectedIndex = null;
        filesModel.resetSelection();
        filesView.clearPanel();

        paginationController.updateFilePages();
        paginationController.updateFileCount();

        const currentFiles = filesModel.getCurrentPageFiles();
        paginationController.updateCurrentFiles();

        if (signal.aborted) return;

        filesView.showLoadingBar();
        for (const file of currentFiles) {
            if (signal.aborted) {
                filesView.hideLoadingBar();
                return;
            }
            
            const { thumbnailSrc, fullSize, missing } = await resolveThumbnailForFile(file);
            const containerSize = settingsModel.iconSize;

            filesView.createFileElement(file, {
                thumbnailSrc,
                fullSize,
                missing,
                containerSize
            });
            const progress = Math.round(((currentFiles.indexOf(file) + 1) / currentFiles.length) * 100);
            filesView.updateLoadingBar(progress);
        };
        filesView.hideLoadingBar();
    },
}

function toggleSelection(container, isCtrlPressed, isShiftPressed) {
    const fileContainers = filesView.findAllContainers();
    const currentIndex = fileContainers.indexOf(container);

    if (isShiftPressed && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, currentIndex);
        const end = Math.max(lastSelectedIndex, currentIndex);
        for (let i = start; i <= end; i++) {
            const path = fileContainers[i].dataset.path;
            filesModel.selectFileByPath(path);
            filesView.setContainerSelected(fileContainers[i], true);
        }
    } else if (isCtrlPressed) {
        const path = container.dataset.path;
        const isChecked = filesModel.toggleSelectFileByPath(path);
        filesView.setContainerSelected(container, isChecked);
    } else {
        filesModel.resetSelection();
        filesView.resetSelection();

        const id = container.dataset.id;
        const path = container.dataset.path;

        filesModel.selectFileByPath(path);
        filesView.setContainerSelected(container, true);
    }

    lastSelectedIndex = currentIndex;
    paginationController.updateSelectedFileCount();
}

async function selectFile(file) {
    filesModel.resetSelection();
    filesView.resetSelection();

    filesModel.selectFileByPath(file.path);
    const container = filesView.findFileContainerByPath(file.path); 
    filesView.setContainerSelected(container, true);
    
    paginationController.updateSelectedFileCount();

    filesModel.currentPreviewFile = file;

    await filePreviewController.renderFileInfo(file);
    await filePreviewController.renderFilePreview(file);

    previewTabController.sendPostMessage('update-preview', { file: file });

    const visible = filesModel.getCurrentPageFiles();
    lastSelectedIndex = visible.findIndex(f => f.path === file.path);
}

async function resolveThumbnailForFile(file) {

    // directory
    if (file.isDirectory) {
        return { thumbnailSrc: 'images/folder-256.png', fullSize: false, missing: false };
    }

    const filePath = file.path;

    // file missing
    if (!await window.api.fileExists(filePath)) {
        return { thumbnailSrc: 'images/cross.png', fullSize: false, missing: true };
    }

    // If we have a cached thumbnail path, use it
    if (thumbnailCache && thumbnailCache.has(filePath)) {
        const cached = thumbnailCache.get(filePath);
        if (cached) return { thumbnailSrc: cached, fullSize: true, missing: false };
        return { thumbnailSrc: 'images/file-256.png', fullSize: false, missing: false };
    }

    // If thumbnail generation is enabled, try to generate (main will return path if successful) and save to cache

    try {
        const genPath = await window.api.generateThumbnail(file, settingsModel.thumbGen);
        if (genPath) {
            thumbnailCache.set(filePath, genPath);
            return { thumbnailSrc: genPath, fullSize: true, missing: false };
        }
    } catch (err) {
        console.error('resolveThumbnailForFile (generate): error', err);
    }    


    // No thumbnail available
    return { thumbnailSrc: 'images/file-256.png', fullSize: false, missing: false };
}
