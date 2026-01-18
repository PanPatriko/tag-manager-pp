import { paginationModel } from '../model/paginationModel.js';

import { paginationController } from "../controller/paginationController.js"
import { filesController } from "../controller/filesController.js";

export const settingsView = {

    settingsModal: null,
    languageSelect: null,
    iconSize: null,
    maxFiles: null,
    videoAutoplayCheckbox: null,
    videoLoopCheckbox: null,
    defaultTagColor: null,
    defaultTagTextColor: null,

    init() {
        this.settingsModal = document.getElementById('settings-modal');
        this.languageSelect = document.getElementById('language-select');
        this.iconSize = document.getElementById('icon-size');
        this.maxFiles = document.getElementById('max-files');
        this.videoAutoplayCheckbox = document.getElementById('vid-autoplay');
        this.videoLoopCheckbox = document.getElementById('vid-loop');
        this.defaultTagColor = document.getElementById('def-tag-bgcolor');
        this.defaultTagTextColor = document.getElementById('def-tag-textcolor');
    },

    setLanguage(value) {
        this.languageSelect.value = value;
    },

    setIconSize(value) {
        this.iconSize.value = value;
    },

    setMaxFiles(value) {
        this.maxFiles.value = value;
    },    

    setVidAutoplay(value) { 
        this.videoAutoplayCheckbox.checked = value;
    },

    setVidLoop(value) { 
        this.videoLoopCheckbox.checked = value;
    },
    
    setDefaultTagColor(value) { 
        this.defaultTagColor.value = value;
    },

    setDefaultTagTextColor(value) { 
        this.defaultTagTextColor.value = value;
    },  
    
    closeModal() { 
        this.settingsModal.classList.add('hidden');
    },

    openModal() { 
        this.settingsModal.classList.remove('hidden');
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
        this.languageSelect.addEventListener('change', (e) => handler(e.target.value));
    },

    onIconSizeChange(handler) {
        this.iconSize.addEventListener('change', (e) => handler(e.target.value));
    },

    onMaxFilesChange(handler) {
        this.maxFiles.addEventListener('change', (e) => handler(e.target.value));
    },

    onVidAutoplayChange(handler) {
        this.videoAutoplayCheckbox.addEventListener('change', (e) => handler(e.target.checked));
    },

    onVidLoopChange(handler) {
        this.videoLoopCheckbox.addEventListener('change', (e) => handler(e.target.checked));
    },

    onDefaultTagColorChange(handler) {
        this.defaultTagColor.addEventListener('change', (e) => handler(e.target.value));
    },

    onDefaultTagTextColorChange(handler) {
        this.defaultTagTextColor.addEventListener('change', (e) => handler(e.target.value));
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

    applyMaxFiles() {
        paginationModel.setCurrentPage(1);
        paginationController.updateFilePages();
        filesController.displayFiles();
    },
};