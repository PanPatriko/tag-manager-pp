import {files, currentLocation, rootLocation, currentPage, setCurrentPage} from '../state.js';
import { settingsModel } from '../model/settingsModel.js';
import { displayDirectory, displayFiles } from "./content.js";
import { searchFiles, displaySearchTags } from '../header/searchBar.js';

const filePagesSelect = document.getElementById('file-pages');
const parentDirButton = document.getElementById('parent-directory');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

let history = [];
let historyIndex = -1;

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
    if(currentLocation != rootLocation) {
        try {
            const parentLocation = await window.api.getDirectoryParent(currentLocation);
            pushToHistory({ type: 'directory', path: parentLocation });
            displayDirectory(parentLocation);
        } catch(error) {
            showPopup('', error, 'error');
        }
    }
});

prevButton.addEventListener('click', () => {
    if (historyIndex > 0) {
        goToHistory(historyIndex - 1);
    }
});

nextButton.addEventListener('click', () => {
    if (historyIndex < history.length - 1) {
        goToHistory(historyIndex + 1);
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

export function pushToHistory(location) {
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(location);
    historyIndex = history.length - 1;
    updateHistoryButtons();
}

function goToHistory(index) {
    if (index >= 0 && index < history.length) {
        historyIndex = index;
        const entry = history[historyIndex];
        if (entry.type === 'directory') {
            displayDirectory(entry.path);
        } else if (entry.type === 'search') {
            const andTags = [...entry.andTags];
            const orTags = [...entry.orTags];
            const notTags = [...entry.notTags];
            displaySearchTags(andTags, orTags, notTags);
            searchFiles(andTags, orTags, notTags);
        }
        updateHistoryButtons();
    }
}

function updateHistoryButtons() {
    prevButton.disabled = historyIndex <= 0;
    nextButton.disabled = historyIndex >= history.length - 1;
}