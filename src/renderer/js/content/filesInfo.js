import { formatString } from '../i18n.js';
import { i18nModel } from '../model/i18nModel.js';

const fileCountLabel = document.getElementById('total-file-count');
const selectedFileCountLabel = document.getElementById('selected-file-count');
const currentFilesLabel = document.getElementById('current-files');

let fileCount = '0';
let folderCount = '0';
let rangeStart = '0';
let rangeEnd = '0';

export function updateFileCount(count, folders) {
    fileCount = count;
    folderCount = folders;
    if (folders > 0) {
        fileCountLabel.textContent = formatString(i18nModel.t('content-files-and-directories-count'), {
            count: count || '0',
            folders: folders,
            total: count + folders
        });
    } else {
        fileCountLabel.textContent = formatString(i18nModel.t('content-files-count'), {
            count: count || '0'
        });
    }
}

export function updateSelectedFileCount() {
    const fileContainers = Array.from(document.querySelectorAll('.file-container'));
    const selectedCount = fileContainers.filter(el => el.getAttribute('data-checked') === 'true').length;
    selectedFileCountLabel.textContent = formatString(i18nModel.t('content-selected-files-count'), {
        selectedCount: selectedCount || '0'
    });
}

export function updateCurrentFilesLabel(start, end) {
    rangeStart = start;
    rangeEnd = end;
    currentFilesLabel.textContent = formatString(i18nModel.t('content-current-files-range'), {
        start: start || '0',
        end: end || '0'
    });
}

export function refreshLabels() {
    updateFileCount(fileCount, folderCount);
    updateSelectedFileCount();
    updateCurrentFilesLabel(rangeStart, rangeEnd);
}