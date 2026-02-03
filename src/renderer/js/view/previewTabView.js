export const previewTabView = {

    init() {
        this.filePreview = document.getElementById('file-preview');
    },

    getPreviewElement() {
        return this.filePreview?.querySelector('*') || null;
    },

    setPageTitle(title) {
        document.title = title;
    },

    setTheme(theme) {
        document.body.className = theme;
    }
};
