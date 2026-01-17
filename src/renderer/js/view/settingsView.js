import { paginationModel } from '../model/paginationModel.js';

import { paginationController } from "../controller/paginationController.js"
import { filesController } from "../controller/filesController.js";

const settingsModal = document.getElementById('settings-modal');

const languageSelect = document.getElementById('language-select');
const iconSize = document.getElementById('icon-size');
const maxFiles = document.getElementById('max-files');

const videoAutoplayCheckbox = document.getElementById('vid-autoplay'); 
const videoLoopCheckbox = document.getElementById('vid-loop');

const defaultTagColor = document.getElementById('def-tag-bgcolor');
const defaultTagTextColor = document.getElementById('def-tag-textcolor');

export const settingsView = {

    setLanguage(value) {
        languageSelect.value = value;
    },

    setIconSize(value) {
        iconSize.value = value;
    },

    setMaxFiles(value) {
        maxFiles.value = value;
    },    

    setVidAutoplay(value) { 
       videoAutoplayCheckbox.checked = value;
    },

    setVidLoop(value) { 
        videoLoopCheckbox.checked = value;
    },
    
    setDefaultTagColor(value) { 
       defaultTagColor.value = value;
    },

    setDefaultTagTextColor(value) { 
        defaultTagTextColor.value = value;
    },  
    
    closeModal() { 
        settingsModal.classList.add('hidden');
    },

    openModal() { 
        settingsModal.classList.remove('hidden');
    },

    onOpenModalClick(handler) {
        const el = document.getElementById('open-settings-modal');
        el.addEventListener('click', (e) => handler(e.target.value));
    },

    onCloseModalClick(handler) {
        const el = document.getElementById('close-settings-modal');
        el.addEventListener('click', (e) => handler(e.target.value));
    },

    onToggleThemeClick(handler) {
        const el = document.getElementById('theme-toggle');
        el.addEventListener('click', () => handler());
    },

    onLanguageChange(handler) {
        languageSelect.addEventListener('change', (e) => handler(e.target.value));
    },

    onIconSizeChange(handler) {
        iconSize.addEventListener('change', (e) => handler(e.target.value));
    },

    onMaxFilesChange(handler) {
        maxFiles.addEventListener('change', (e) => handler(e.target.value));
    },

    onVidAutoplayChange(handler) {
        videoAutoplayCheckbox.addEventListener('change', (e) => handler(e.target.checked));
    },

    onVidLoopChange(handler) {
        videoLoopCheckbox.addEventListener('change', (e) => handler(e.target.checked));
    },

    onDefaultTagColorChange(handler) {
        defaultTagColor.addEventListener('change', (e) => handler(e.target.value));
    },

    onDefaultTagTextColorChange(handler) {
        defaultTagTextColor.addEventListener('change', (e) => handler(e.target.value));
    },

    applyIconSize(value) {
        document.querySelectorAll('.file-container').forEach(el => {
            el.style.width = `${value}px`;
            el.style.height = `${value}px`;
        });
        document.querySelectorAll('.directory-container').forEach(el => {
            el.style.width = `${value}px`;
            el.style.height = `${value}px`;
        });
        document.querySelectorAll('.file-thumbnail-text').forEach(el => {
            el.style.fontSize = `${value / 10}px`;
        });

        const gap = Math.max(10, value / 10); // jako funkcja w files View ??
        const padding = Math.max(10, value / 12.5);
        const filesPanel = document.getElementById('files-panel');

        filesPanel.style.gap = `${gap}px`;
        filesPanel.style.padding = `${padding}px`;
        filesPanel.style.gridTemplateColumns = `repeat(auto-fill, ${value}px)`;
    },

    applyMaxFiles(value) {
        paginationModel.setCurrentPage(1);
        paginationController.updateFilePages();
        filesController.displayFiles();
    },
};