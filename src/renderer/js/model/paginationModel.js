
import { filesModel } from './filesModel.js';
import { settingsModel } from './settingsModel.js';

let currentPage = 1;
let fileCount = 0;
let folderCount = 0;
let rangeStart = 0;
let rangeEnd = 0;

export const paginationModel = {

    getTotalPages() {
        return Math.max(1, Math.ceil(filesModel.files.length / settingsModel.maxFilesPerPage));
    },

    setCurrentPage(page) {
        const totalPages = this.getTotalPages();
        currentPage = Math.max(1, Math.min(page, totalPages));
    },

    getCurrentPage() {
        return currentPage;
    },

    setFileCount(count) {
        fileCount = count;
    },

    getFileCount() {
        return fileCount;
    },

    setFolderCount(count) {
        folderCount = count;
    },

    getFolderCount() {
        return folderCount;
    },

    setRange(start, end) {
        rangeStart = start;
        rangeEnd = end;
    },

    getRange() {
        return { start: rangeStart, end: rangeEnd };
    }

}