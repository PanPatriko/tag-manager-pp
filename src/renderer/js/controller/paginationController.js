import { i18nModel } from '../model/i18nModel.js';
import { paginationModel } from '../model/paginationModel.js';
import { filesModel } from '../model/filesModel.js';
import { settingsModel } from '../model/settingsModel.js';
import { locationsModel } from '../model/locationsModel.js';

import { paginationView } from '../view/paginationView.js';

import { historyController } from './historyController.js';
import { filesController } from "./filesController.js";

import { formatString } from '../utils.js';

export const paginationController = {

    init() {
        paginationView.onNextPageClick(() => {
            const currentPage = paginationModel.getCurrentPage();
            if (currentPage * settingsModel.maxFilesPerPage < filesModel.files.length) {
                paginationModel.setCurrentPage(currentPage + 1);
                filesController.displayFiles();
            }
        });

        paginationView.onPrevPageClick(() => {
            const currentPage = paginationModel.getCurrentPage();
            if (currentPage > 1) {
                paginationModel.setCurrentPage(currentPage - 1);
                filesController.displayFiles();
            }
        });

        paginationView.onPageSelectChange((e) => {
            paginationModel.setCurrentPage(parseInt(e.target.value, 10));
            filesController.displayFiles();
        });

        paginationView.onParentDirClick(async () => {
            if (locationsModel.currentDirectory != locationsModel.root) {
                try {
                    const parentLocation = await window.api.getDirectoryParent(locationsModel.currentDirectory);
                    historyController.pushToHistory({ type: 'directory', path: parentLocation });
                    filesController.displayDirectory(parentLocation);
                } catch (error) {
                    showPopup(error, 'error');
                }
            }
        });
    },

    updateFileCount() {
        const { total, directories, files } = filesModel.getFilesCount();

        let text = '';

        if (directories > 0) {
            text = formatString(i18nModel.t('content-files-and-directories-count'), {
                count: files || '0',
                folders: directories,
                total: total
            });
        } else {
            text = formatString(i18nModel.t('content-files-count'), {
                count: files || '0'
            });
        }

        paginationView.setFileCount(text);
        updateCurrentFilesLabel();
        this.updateSelectedFileCount();
    },

    updateSelectedFileCount() {
        const selectedCount = filesModel.getSelectedFiles().length;

        const text = formatString(i18nModel.t('content-selected-files-count'), {
            selectedCount: selectedCount || '0'
        });
        paginationView.setSelectedFileCount(text);
    },

    updateFilePages() {
        const totalPages = Math.ceil(filesModel.files.length / settingsModel.maxFilesPerPage);
        const currentPage = paginationModel.getCurrentPage();

        if (currentPage > totalPages) {
            paginationModel.setCurrentPage(1);
        }

        paginationView.renderPagesSelect(totalPages, currentPage);
    }  
}

function updateCurrentFilesLabel() {
    let { start, end } = filesModel.getCurrentPageRange();
    if (filesModel.files.length > 0) {
        start += 1;
    }
    const text = formatString(i18nModel.t('content-current-files-range'), {
        start: start || '0',
        end: end || '0'
    });

    paginationView.setCurrentFilesRange(text);
}
