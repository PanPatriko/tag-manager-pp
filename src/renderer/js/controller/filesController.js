import { filesModel } from '../model/filesModel.js';
import { locationsModel } from '../model/locationsModel.js';
import { paginationModel } from '../model/paginationModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { filesView } from '../view/filesView.js';
import { paginationView } from '../view/paginationView.js';

import { filePreviewController } from "./filePreviewController.js"
import { historyController } from './historyController.js';
import { paginationController  } from './paginationController.js';
import { previewTabController } from './previewTabController.js';

let lastSelectedIndex = null;
let displayAbortController = null;

const path = window.api.path;

export const filesController = {
    
    abortDisplay() {
        if (displayAbortController) {
            displayAbortController.abort();
        }
    },

    init() {
        filesView.init();

        filesView.onSortByChange(async (value) => {
            if (filesModel.files.length < 2) return;
            
            filesModel.setSortBy(value);

            filesView.showLoadingBar();
            await filesModel.sortFiles({
                onProgress: ({ progress }) => filesView.updateLoadingBar(progress)
            });
            filesView.hideLoadingBar();

            await this.displayFiles();
        });

        filesView.onSortOrderChange(async (value) => {
            if (filesModel.files.length < 2) return;

            filesModel.setSortOrder(value);

            filesView.showLoadingBar();
            await filesModel.sortFiles({
                onProgress: ({ progress }) => filesView.updateLoadingBar(progress)
            });
            filesView.hideLoadingBar();

            await this.displayFiles();
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
        filesModel.selectPageFiles();
        filesView.selectAllFiles();
        paginationController.updateSelectedFileCount();
    },

    async selectNextFile() {
        const currentFiles = paginationModel.getCurrentPageFiles();
        if (currentFiles.length === 0) return;

        if (lastSelectedIndex === null) {
            lastSelectedIndex = 0;
        } else {
            lastSelectedIndex = (lastSelectedIndex + 1) % currentFiles.length;
        }

        const fileToSelect = currentFiles[lastSelectedIndex];
        await selectFile(fileToSelect);
    },

    async selectPreviousFile() {
        const currentFiles = paginationModel.getCurrentPageFiles();
        if (currentFiles.length === 0) return;

        if (lastSelectedIndex === null) {
            lastSelectedIndex = currentFiles.length - 1;
        } else {
            lastSelectedIndex = (lastSelectedIndex - 1 + currentFiles.length) % currentFiles.length;
        }

        const fileToSelect = currentFiles[lastSelectedIndex];
        await selectFile(fileToSelect);
    },

    async displayDirectory(dirPath) {
        this.abortDisplay();

        const dirFiles = await window.api.getFilesInPath(dirPath);

        if (dirFiles.error) {
            console.error('displayDirectory: error', dirFiles.error);
            showPopup(dirFiles.error, 'error');
            return;
        }

        paginationView.disableParentDir(locationsModel.root === dirPath);
        paginationView.setDirectoryName(await path.basename(dirPath));

        locationsModel.currentDirectory = dirPath;

        filesModel.enrichFilesFlag = true;
        filesModel.files = dirFiles;

        filesView.showLoadingBar();
        await filesModel.sortFiles({
            onProgress: ({ progress }) => filesView.updateLoadingBar(progress)
        });
        filesView.hideLoadingBar();

        await this.displayFiles();
    },

    async displayFiles() {
        this.abortDisplay();
        
        displayAbortController = new AbortController();
        const signal = displayAbortController.signal;

        lastSelectedIndex = null;
        filesModel.resetSelection();
        filesView.clearPanel();

        paginationController.updatePagination();

        const currentFiles = paginationModel.getCurrentPageFiles();

        if (signal.aborted) return;

        for (const file of currentFiles) {
            if (signal.aborted) {
                return;
            }

            filesView.createFileElement(file, {
                thumbnailSrc: 'images/file-256.png',
                containerSize: settingsModel.iconSize
            });
        };

        await generateThumbnails(currentFiles);
    },
}

async function enrichFileMetadata(file, pathIndex) {

    // Skip files that already have a fingerprint (metadata) to avoid unnecessary processing
    if (file.fingerprint !== null) {
        return;
    }

    const enrichedFile = await window.api.enrichFileWithMetadata(file, pathIndex);
    Object.assign(file, enrichedFile);  
}

async function generateThumbnails(files) {
    const signal = displayAbortController.signal;
    const pathIndex = new Map();

    if(filesModel.enrichFilesFlag) {
        const dbFiles = await window.api.getAllFilesInDirectory(locationsModel.currentDirectory);

        for (const file of dbFiles) {
            pathIndex.set(file.path, file);
        }
    }

    for (const file of files) {
        if (signal.aborted) {
            return;
        }

        if (filesModel.enrichFilesFlag) {
            await enrichFileMetadata(file, pathIndex);  
        }

        const { thumbnailSrc, fullSize, missing } = await window.api.generateOrGetThumbnail(file, settingsModel.thumbGen);
        filesView.updateFileElementThumbnail(file, {
            thumbnailSrc,
            fullSize,
            missing
        });
    }
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

    const currentFiles = paginationModel.getCurrentPageFiles();
    lastSelectedIndex = currentFiles.findIndex(f => f.path === file.path);
}
