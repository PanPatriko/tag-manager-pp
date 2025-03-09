import { refreshLabels } from './content/filesInfo.js';

async function loadLocale(locale) {
    const response = await fetch(`../renderer/locales/${locale}.json`);
    const translations = await response.json();
    return translations;
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            element.setAttribute('placeholder', translations[key]);
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[key]) {
            element.setAttribute('title', translations[key]);
        }
    });
}

export function formatString(template, values) {
    return template.replace(/{(\w+)}/g, (match, key) => values[key] || match);
}

export async function setLanguage(locale) {
    const translations = await loadLocale(locale);
    applyTranslations(translations);
    window.translations = translations;
    localStorage.setItem('language', locale);
    refreshLabels(); 
}