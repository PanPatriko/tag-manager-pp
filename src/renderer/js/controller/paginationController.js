import { paginationModel } from '../model/paginationModel.js';
import { filesModel } from '../model/filesModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { paginationView } from '../view/paginationView.js';

import { displayFiles } from '../content/content.js';

export function initPagination() {

    paginationView.onNextPageClick(() => {
        const currentPage = paginationModel.getCurrentPage();
        if (currentPage * settingsModel.maxFilesPerPage < filesModel.files.length) {
            paginationModel.setCurrentPage(currentPage + 1);
            displayFiles();
        }
    });

    paginationView.onPrevPageClick(() => {
        const currentPage = paginationModel.getCurrentPage();
        if (currentPage > 1) {
            paginationModel.setCurrentPage(currentPage - 1);
            displayFiles();
        }
    });

    paginationView.onPageSelectChange((e) => {
        paginationModel.setCurrentPage(parseInt(e.target.value, 10));
        displayFiles();
    });
}

export function updateFilePages() {
    const totalPages = Math.ceil(filesModel.files.length / settingsModel.maxFilesPerPage);
    const currentPage = paginationModel.getCurrentPage();

    if (currentPage > totalPages) {
        paginationModel.setCurrentPage(1);
    }

    paginationView.renderPagesSelect(totalPages, currentPage);
}
