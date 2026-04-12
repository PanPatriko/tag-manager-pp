import { paginationModel } from "./paginationModel.js";

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

let files = [];
let currentPreviewFile = null;
let sortByNameOrder = 'asc';
let sortByDateOrder = 'asc';
let sortBy = 'name';   // Default sort by name
let enrichFilesFlag = true;

function toggleSelectFile(file) {
    if (file.selected === true) {
        file.selected = false;
    } else {
        file.selected = true;
    }
    return file.selected;
}

export const filesModel = { 
    get files() { return files;},
    set files(newFiles) { files = newFiles; },
    get currentPreviewFile() { return currentPreviewFile; },
    set currentPreviewFile(file) { currentPreviewFile = file; },
    get sortByNameOrder() { return sortByNameOrder; },
    get sortByDateOrder() { return sortByDateOrder; },
    get enrichFilesFlag() { return enrichFilesFlag; },
    set enrichFilesFlag(value) { enrichFilesFlag = value; },

    async addFileToDB(file) {
        if (file.fingerprint === null) {
            showPopup(i18nModel.t('alert.noMetadataLoaded'), 'warning');
            return;
        }

        const newFile = await window.api.addFile(file);
        newFile.isDirectory = newFile.is_directory === 1;

        Object.assign(file, newFile);

        if (file.path === currentPreviewFile.path) {
            Object.assign(currentPreviewFile, newFile);
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

    getFilesCount() {
        const directories = files.filter(file => file.isDirectory).length;
        return {
            total: files.length,
            directories,
            files: files.length - directories
        };
    },

    selectFileByPath(filePath) {
        const file = files.find(file => file.path == filePath);
        file.selected = true;
        return file.selected;
    },

    toggleSelectFileByPath(filePath) {
        const file = files.find(file => file.path == filePath);
        return toggleSelectFile(file);
    },

    selectPageFiles() {
        const currentFiles = paginationModel.getCurrentPageFiles();

        currentFiles.forEach(pageFile => {
            const file = files.find(f => f.path === pageFile.path);
            if (file) {
                file.selected = true;
            }
        });
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

    async sortFiles({ onProgress } = {}) {
        if (files.length < 2) return;

        if (sortBy === 'date') {
            const filesMissingCreatedAt = files.filter(file => file.created_at == null);
            const total = filesMissingCreatedAt.length;

            for (let i = 0; i < total; i++) {
                const enrichedFile = await window.api.enrichFileWithMetadata(filesMissingCreatedAt[i]);
                Object.assign(filesMissingCreatedAt[i], enrichedFile);

                onProgress?.({
                    current: i + 1,
                    total,
                    progress: total === 0 ? 100 : Math.round(((i + 1) / total) * 100),
                    stage: 'enrich'
                });
            }
        }

        files = files.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) { return -1; }
            if (!a.isDirectory && b.isDirectory) { return 1; }

            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();

            if (sortBy === 'name') {
                return sortByNameOrder === 'asc' ? collator.compare(nameA, nameB) : collator.compare(nameB, nameA);
            } else if (sortBy === 'date') {
                if (a.created_at !== b.created_at) {
                    const createdAtA = a.created_at ?? 0;
                    const createdAtB = b.created_at ?? 0;
                    return sortByDateOrder === 'asc' ? createdAtA - createdAtB : createdAtB - createdAtA;
                }
                return sortByNameOrder === 'asc' ? collator.compare(nameA, nameB) : collator.compare(nameB, nameA);
            }
        });
    },
}
