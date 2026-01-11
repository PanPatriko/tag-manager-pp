
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
    }

}