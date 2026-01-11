import { paginationModel } from "./paginationModel.js";
import { settingsModel } from "./settingsModel.js";

let files = [];
let currentPreviewFile = null;
let sortByNameOrder = 'asc';
let sortByDateOrder = 'asc';
let sortBy = 'name';   // Default sort by name
let start, end;

function toggleSelectFile(file) {
    if (file.selected === true) {
        file.selected = false;
    } else {
        file.selected = true;
    }
    return file.selected;
}

function sortFilesByName() {
    if (files.length < 2) return;

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    files = files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) {
            return -1;
        }
        if (!a.isDirectory && b.isDirectory) {
            return 1;
        }
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sortByNameOrder === 'asc' ? collator.compare(nameA, nameB) : collator.compare(nameB, nameA);
    });
}

async function sortFilesByDate() {
    if (files.length < 2) return;

    // fetch missing createdDate values in parallel
    await Promise.all(files.map(async (f) => {
        if (!f.createdDate) {
            try {
                // adjust call to your renderer API surface (window.api.getFileCreationDate or window.api.invoke)
                const cd = await window.api.getFileCreationDate(f.path);
                f.createdDate = cd || null; // keep as "yyyyMMdd" string or null
            } catch (e) {
                f.createdDate = null;
            }
        }
        // normalize numeric value for comparison
        f.__createdNum = f.createdDate ? Number(f.createdDate) : 0;
    }));

    // synchronous comparator using numeric yyyyMMdd (or timestamp)
    files = files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        const da = a.__createdNum;
        const db = b.__createdNum;
        return sortByDateOrder === 'asc' ? da - db : db - da;
    });

    // cleanup temporary fields
    files.forEach(f => delete f.__createdNum);
}

export const filesModel = { 
    get files() { return files;},
    set files(newFiles) { files = newFiles; },
    get currentPreviewFile() { return currentPreviewFile; },
    set currentPreviewFile(file) { currentPreviewFile = file; },
    get sortByNameOrder() { return sortByNameOrder; },
    get sortByDateOrder() { return sortByDateOrder; },

    async createFile(filePath) {
        const fileName = filePath.split('\\').pop();
        const newFile = await window.api.createFile({ name: fileName, path: filePath });
        const file = files.find(file => file.path === filePath);
        if (file) {
            file.id = newFile.id;
        }
        return file;
    },

    async deleteFile(id) {
        await window.api.deleteFileById(id);
        files.find(file => file.id == id).id = null;
        if (id == currentPreviewFile.id) {
            currentPreviewFile.id = null;
        }
    },

    getFileById(fileId) {
        return files.find(file => file.id == fileId);
    },

    getFileByPath(filePath) {
        return files.find(file => file.path === filePath);
    },
    
    getSelectedFiles() {
        return files.filter(file => file.selected);
    },

    getCurrentPageFiles() {
        if (files.length === 0) {
            start, end = 0, 0;
            return [];
        }

        start = (paginationModel.getCurrentPage() - 1) * settingsModel.maxFilesPerPage;
        end = Math.min(start + settingsModel.maxFilesPerPage, files.length);
        const currentPageFiles = files.slice(start, end);
        return currentPageFiles;
    },

    getCurrentPageRange() {
        return { start, end };
    },

    getFilesCount() {
        const directories = files.filter(file => file.isDirectory).length;
        return {
            total: files.length,
            directories,
            files: files.length - directories
        };
    },

    isFileSelected(fileId) {
        const file = files.find(file => file.id == fileId);
        return file?.selected === true;
    },

    selectFileById(fileId, toggle = true) {
        const file = files.find(file => file.id == fileId);
        if (toggle) {
            return toggleSelectFile(file);
        }
        file.selected = true;
        return file.selected;
    },

    selectFileByPath(filePath, toggle = true) {
        const file = files.find(file => file.path == filePath);
        if (toggle) {
            return toggleSelectFile(file);
        }
        file.selected = true;
        return file.selected;
    },

    selectAllFiles() {
        files.forEach(file => file.selected = true);
    },

    selectCurrentPageFiles() {
        const currentFiles = this.getCurrentPageFiles();
        files.forEach(file => {
            if (currentFiles.includes(file)) {
                file.selected = true;
            }});
    },

    selectAllVisibleFiles(visibleFiles) {
        visibleFiles.forEach(file => file.selected = true);
    },

    resetSelection() {
        files.forEach(file => file.selected = false);
    },

    changeSortByNameOrder() {
        sortByNameOrder = sortByNameOrder === 'asc' ? 'desc' : 'asc';
    },

    changeSortByDateOrder() {
        sortByDateOrder = sortByDateOrder === 'asc' ? 'desc' : 'asc';
    },

    setSortBy(by) {
        sortBy = by;
    },

    async sortFiles() {
        if (sortBy === 'name') {
            sortFilesByName();
        } else if (sortBy === 'date') {
            await sortFilesByDate();
        }
    },
}