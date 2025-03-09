import {files, currentLocation, rootLocation, currentPage, setCurrentPage, maxFilesPerPage} from '../state.js';
import { displayDirectory, displayFiles } from "./content.js";

const filePagesSelect = document.getElementById('file-pages');
const prevDirButton = document.getElementById('prev-directory');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

filePagesSelect.addEventListener('change', (e) => {
    setCurrentPage(parseInt(e.target.value, 10));
    displayFiles(files);
});

nextPageButton.addEventListener('click', () => {
    if (currentPage * maxFilesPerPage < files.length) {
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

prevDirButton.addEventListener('click', async () => {
    if(currentLocation != rootLocation) {
        try {
            const parentLocation = await window.api.getDirectoryParent(currentLocation);
            displayDirectory(parentLocation);
        } catch(error) {
            Swal.fire({
                text: error,
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'custom-swal-popup'
                }
            });
        }
    }
});

export function updateFilePages() {
    const totalPages = Math.ceil(files.length / maxFilesPerPage);
    filePagesSelect.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        filePagesSelect.appendChild(option);
    }
    filePagesSelect.value = currentPage;
}