import { filesModel } from '../model/filesModel.js';
import { i18nModel } from '../model/i18nModel.js';
import { locationsModel } from '../model/locationsModel.js';
import { paginationModel } from '../model/paginationModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { paginationView } from '../view/paginationView.js';

import { filesController } from "./filesController.js";
import { historyController } from './historyController.js';

import { formatString } from '../utils.js';

export const paginationController = {

    init() {
        paginationView.init();

        paginationView.onNextPageClick(async () => {
            filesController.abortDisplay();
            const currentPage = paginationModel.getCurrentPage();
            if (currentPage * settingsModel.maxFilesPerPage < filesModel.files.length) {
                paginationModel.setCurrentPage(currentPage + 1);
                paginationView.disableNextPageButton(true);
                await filesController.displayFiles();
                paginationView.disableNextPageButton(false);
            }
        });

        paginationView.onPrevPageClick(async () => {
            filesController.abortDisplay();
            const currentPage = paginationModel.getCurrentPage();
            if (currentPage > 1) {
                paginationModel.setCurrentPage(currentPage - 1);
                paginationView.disablePrevPageButton(true);
                await filesController.displayFiles();
                paginationView.disablePrevPageButton(false);
            }
        });

        paginationView.onPageSelectChange(async (e) => {
            filesController.abortDisplay();
            paginationModel.setCurrentPage(parseInt(e.target.value, 10));
            await filesController.displayFiles();
        });

        paginationView.onParentDirClick(async () => {
            filesController.abortDisplay();
            if (locationsModel.currentDirectory != locationsModel.root) {
                try {
                    const parentLocation = await window.api.getDirectoryParent(locationsModel.currentDirectory);
                    historyController.pushToHistory({ type: 'directory', path: parentLocation });
                    paginationView.disableParentDirButton(true);
                    await filesController.displayDirectory(parentLocation);
                    paginationView.disableParentDirButton(false);
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

        if (paginationModel.getCurrentPage() > totalPages) {
            paginationModel.setCurrentPage(1);
        }

        paginationView.renderPagesSelect(totalPages, paginationModel.getCurrentPage());
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
