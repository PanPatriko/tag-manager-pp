import { i18nModel } from '../model/i18nModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { previewTabView } from '../view/previewTabView.js';

import { contextMenuController } from './contextMenuController.js';
import { filePreviewController } from './filePreviewController.js';

export const previewTabController = {
    file: null,
    previewWindow: null,

    async init() {

        previewTabView.init();
        filePreviewController.initPreviewTab();

        previewTabView.setTheme(settingsModel.theme);

        await i18nModel.load(settingsModel.language);
        previewTabView.setPageTitle(i18nModel.t('title-file-preview') || 'File Preview');

        contextMenuController.initPreviewTab();

        this.setupEventListeners();
        
        const file = this.getFileFromQuery();
        if (file) {
            await filePreviewController.renderFilePreview(file);
            this.file = file;
        }
    },

    getFile() {
        return this.file;
    },

    setupEventListeners() {

        // Arrow key navigation
        document.addEventListener('keydown', (event) => {
            if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && window.opener) {
                window.opener.postMessage({
                    type: 'preview-arrow',
                    key: event.key
                }, '*');
            }
        });

        // Listen for updates from main window
        window.addEventListener('message', (event) => this.handleWindowMessage(event));
    },

    async handleWindowMessage(event) {
        const { type, file, language, theme } = event.data || {};

        if (type === 'update-preview' && file) {
            this.file = file;
            await filePreviewController.renderFilePreview(file);
        }

        if (type === 'update-lang' && language) {
            await i18nModel.load(language);
            previewTabView.setPageTitle(i18nModel.t('title-file-preview') || 'File Preview');
        }

        if (type === 'update-theme' && theme) {
            previewTabView.setTheme(theme);
        }
    },

    getFileFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const path = params.get('file');
        return path ? { path } : null;
    },

    openTab(fileUrl, file) {
        if (this.previewWindow && !this.previewWindow.closed) {
            this.previewWindow.focus();
            this.previewWindow.postMessage({ type: 'update-preview', file }, '*');
        } else {
            this.previewWindow = window.open(fileUrl, 'filePreviewTab');
        }
    },

    sendPostMessage(type, data) {
        if (this.previewWindow && !this.previewWindow.closed) {
            this.previewWindow.postMessage({ type, ...data }, '*');
        }
    }
};
