
import { filesModel } from './filesModel.js';
import { settingsModel } from './settingsModel.js';

let currentPage = 1;

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

    getCurrentPageFiles() {
        const { start, end } = this.getCurrentPageRange();
        const currentPageFiles = filesModel.files.slice(start, end);
        return currentPageFiles;
    },

    getCurrentPageRange() {
        let start, end;
        if (filesModel.files.length === 0) {
            start = 0;
            end = 0;
        } else {
            start = (paginationModel.getCurrentPage() - 1) * settingsModel.maxFilesPerPage;
            end = Math.min(start + settingsModel.maxFilesPerPage, filesModel.files.length);
        }
        return { start, end };
    },

}