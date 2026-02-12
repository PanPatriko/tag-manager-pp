import { i18nModel } from '../model/i18nModel.js';
import { paginationModel } from '../model/paginationModel.js';
import { settingsModel } from '../model/settingsModel.js';

import { i18nView } from '../view/i18nView.js';
import { settingsView } from '../view/settingsView.js';

import { filesController } from './filesController.js';
import { paginationController } from './paginationController.js';
import { previewTabController } from './previewTabController.js';

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
        await applyMaxFiles();

        settingsView.setThumGen(settingsModel.thumbGen);

        settingsView.setSearchBarMode(settingsModel.searchBarMode);
        settingsView.setTagModalMode(settingsModel.tagModalMode);
        settingsView.setFileTagModalMode(settingsModel.fileTagModalMode);

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
            previewTabController.sendPostMessage('update-theme', { theme: newTheme });
        });

        settingsView.onLanguageChange(async (lang) => {
            settingsModel.language = lang;
            await setLanguage(lang);
            previewTabController.sendPostMessage('update-lang', { language: lang });
        });

        settingsView.onIconSizeChange((size) => {
            settingsModel.iconSize = size;
            settingsView.applyIconSize(size);
        });

        settingsView.onMaxFilesChange(async (value) => {
            settingsModel.maxFilesPerPage = value;
            await applyMaxFiles();
        });

        settingsView.onThumbGenChange((checked) => {
            settingsModel.thumbGen = checked;
        });

        settingsView.onSearchBarModeChange((value) => {
            settingsModel.searchBarMode = value;
        });

        settingsView.onTagModalModeChange((value) => {
            settingsModel.tagModalMode = value;
        });

        settingsView.onFileTagModalModeChange((value) => {
            settingsModel.fileTagModalMode = value;
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

async function applyMaxFiles() {
    paginationModel.setCurrentPage(1);
    paginationController.updateFilePages();
    await filesController.displayFiles();
}
