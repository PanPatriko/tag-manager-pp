import {files, currentPage, setCurrentPage} from '../state.js';
import { displayDirectory, displayFiles } from "./content.js";

import { pushToHistory } from "../controller/historyController.js"
import { settingsModel } from '../model/settingsModel.js';
import { locationsModel } from '../model/locationsModel.js';

const filePagesSelect = document.getElementById('file-pages');
const parentDirButton = document.getElementById('parent-directory');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

filePagesSelect.addEventListener('change', (e) => {
    setCurrentPage(parseInt(e.target.value, 10));
    displayFiles(files);
});

nextPageButton.addEventListener('click', () => {
    if (currentPage * settingsModel.maxFilesPerPage < files.length) {
        setCurrentPage(currentPage + 1);
        displayFiles(files);
    }
});

prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
        displayFiles(files);
    }
});

parentDirButton.addEventListener('click', async () => {
    if(locationsModel.currentDirectory != locationsModel.root) {
        try {
            const parentLocation = await window.api.getDirectoryParent(locationsModel.currentDirectory);
            pushToHistory({ type: 'directory', path: parentLocation });
            displayDirectory(parentLocation);
        } catch(error) {
            showPopup('', error, 'error');
        }
    }
});

export function updateFilePages() {
    const totalPages = Math.ceil(files.length / settingsModel.maxFilesPerPage);
    filePagesSelect.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        filePagesSelect.appendChild(option);
    }
    if (currentPage > totalPages) {
        //setCurrentPage(totalPages);
        setCurrentPage(1);
    }
    filePagesSelect.value = currentPage;
}