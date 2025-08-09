import { settingsModel } from '../model/settingsModel.js';
import { settingsView } from '../view/settingsView.js';
import { setLanguage } from '../i18n.js';
import { previewWindow } from '../contextMenu/contextMenu.js';

export async function initSettingsController() {
    const languageSelect = document.getElementById('language-select');
    if (!languageSelect) return;

    settingsView.setLanguageSelect(settingsModel.language);
    await setLanguage(settingsModel.language);

    languageSelect.addEventListener('change', async (e) => {
        const lang = e.target.value;
        settingsModel.language = lang;
        await setLanguage(lang);

        if (previewWindow && !previewWindow.closed) {
            previewWindow.postMessage({ type: 'update-lang', language: lang }, '*');
        }
    });
}