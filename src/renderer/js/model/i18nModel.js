export const i18nModel = {
    translations: {},
    async load(locale) {
        const response = await fetch(`../renderer/locales/${locale}.json`);
        this.translations = await response.json();
    },
    t(key) {
        return this.translations[key] || key;
    }
};