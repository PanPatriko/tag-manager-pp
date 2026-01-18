import { i18nModel } from '../model/i18nModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { i18nView } from '../view/i18nView.js';
import { settingsView } from '../view/settingsView.js';

import { previewWindow } from './contextMenuController.js';
import { paginationController } from './paginationController.js';

export const settingsController = {
    
    async init() {
        settingsView.init();

        document.body.className = settingsModel.theme;

        settingsView.setLanguage(settingsModel.language);
        await setLanguage(settingsModel.language);

        const iconSize = settingsModel.iconSize;
        settingsView.setIconSize(iconSize);
        settingsView.applyIconSize(iconSize);

        const maxFiles = settingsModel.maxFilesPerPage;
        settingsView.setMaxFiles(maxFiles);
        settingsView.applyMaxFiles(maxFiles);

        settingsView.setVidAutoplay(settingsModel.vidAutoplay);
        settingsView.setVidLoop(settingsModel.vidLoop);

        settingsView.setDefaultTagColor(settingsModel.defTagBgColor);
        settingsView.setDefaultTagTextColor(settingsModel.defTagTextColor);

        settingsView.onOpenModalClick(() => {
            settingsView.openModal();
        });

        settingsView.onCloseModalClick(() => {
            settingsView.closeModal();
        });

        settingsView.onToggleThemeClick(() => {
            const newTheme = settingsModel.theme === 'light-theme' ? 'dark-theme' : 'light-theme';
            settingsModel.theme = newTheme;
            document.body.className = newTheme;
            previewWindowPostMessage('update-theme', { theme: newTheme });
        });

        settingsView.onLanguageChange(async (lang) => {
            settingsModel.language = lang;
            await setLanguage(lang);
            previewWindowPostMessage('update-lang', { language: lang });
        });

        settingsView.onIconSizeChange((size) => {
            settingsModel.iconSize = size;
            settingsView.applyIconSize(size);
        });

        settingsView.onMaxFilesChange((value) => {
            settingsModel.maxFilesPerPage = value;
            settingsView.applyMaxFiles(value);
        });

        settingsView.onVidAutoplayChange((checked) => {
            settingsModel.vidAutoplay = checked;
        });

        settingsView.onVidLoopChange((checked) => {
            settingsModel.vidLoop = checked;
        });

        settingsView.onDefaultTagColorChange((value) => {
            settingsModel.defTagBgColor = value;
        });

        settingsView.onDefaultTagTextColorChange((value) => {
            settingsModel.defTagTextColor = value;
        });   
    }
}

async function setLanguage(locale) {
    await i18nModel.load(locale);
    i18nView.applyTranslations(i18nModel.translations);
    paginationController.updateFileCount();
}

function previewWindowPostMessage(type, data) {
    if (previewWindow && !previewWindow.closed) {
        previewWindow.postMessage({ type, ...data }, '*');
    }
}
