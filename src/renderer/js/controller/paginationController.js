import { i18nModel } from '../model/i18nModel.js';
import { paginationModel } from '../model/paginationModel.js';
import { filesModel } from '../model/filesModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { paginationView } from '../view/paginationView.js';

import { displayFiles } from '../content/content.js';
import { formatString } from '../utils.js';

export function updateFileCount(count, folders) {
    paginationModel.setFileCount(count);
    paginationModel.setFolderCount(folders);

    let text = '';

    if (folders > 0) {
        text = formatString(i18nModel.t('content-files-and-directories-count'), {
            count: count || '0',
            folders: folders,
            total: count + folders
        });       
    } else {
        text = formatString(i18nModel.t('content-files-count'), {
            count: count || '0'
        });
    }

    paginationView.setFileCount(text);
}

export function updateSelectedFileCount() { // TODO selectes files as model, not from DOM
    const fileContainers = Array.from(document.querySelectorAll('.file-container'));
    const selectedCount = fileContainers.filter(el => el.getAttribute('data-checked') === 'true').length;

    const text = formatString(i18nModel.t('content-selected-files-count'), {
       selectedCount: selectedCount || '0'
    });
    paginationView.setSelectedFileCount(text);
}

export function updateCurrentFilesLabel(start, end) {
    paginationModel.setRange(start, end);

    const text = formatString(i18nModel.t('content-current-files-range'), {
        start: start || '0',
        end: end || '0'
    });

    paginationView.setCurrentFilesRange(text);
}

export function refreshPaginationLabels() {
    const { start, end } = paginationModel.getRange();
    const files = paginationModel.getFileCount();
    const folders = paginationModel.getFolderCount();

    updateFileCount(files, folders);
    updateSelectedFileCount();
    updateCurrentFilesLabel(start, end);
}

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
