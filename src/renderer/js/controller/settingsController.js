import { settingsModel } from '../model/settingsModel.js';
import { settingsView } from '../view/settingsView.js';
import { setLanguage } from '../i18n.js';
import { previewWindow } from '../contextMenu/contextMenu.js';

export async function initSettingsController() {
    initBodyTheme();
    await initLanguageSelect()
}

function initBodyTheme() {
    const savedTheme = settingsModel.theme
    document.body.className = savedTheme;

    const themeToggleButton = document.getElementById('theme-toggle');
    if (!themeToggleButton) return;

    themeToggleButton.addEventListener('click', () => {
        const newTheme = settingsModel.theme === 'light-theme' ? 'dark-theme' : 'light-theme';

        settingsModel.theme = newTheme;
        settingsView.setDocumentTheme(newTheme);
        
        previewWindowPostMessage('update-theme', { theme: newTheme });
    });
}

async function initLanguageSelect() {
    const languageSelect = document.getElementById('language-select');
    if (!languageSelect) return;

    settingsView.setLanguageSelect(settingsModel.language);
    await setLanguage(settingsModel.language);

    languageSelect.addEventListener('change', async (e) => {
        const lang = e.target.value;
        settingsModel.language = lang;
        await setLanguage(lang);

        previewWindowPostMessage('update-lang', { language: lang });
    });
}

function previewWindowPostMessage(type, data) {
    if (previewWindow && !previewWindow.closed) {
        previewWindow.postMessage({ type, ...data }, '*');
    }
}