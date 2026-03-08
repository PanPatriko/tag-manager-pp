import { inputAutoResize, formatSize, formatBirthtime } from '../utils.js';

export const filePreviewView = {
    info: null,
    preview: null,
    fileTagsTree: null,

    fileNameInput: null,
    fileNameSaveButton: null,
    filePathInput: null,
    fileIdInput: null,
    fileSizeInput: null,
    fileCreatedInput: null,
    fileModifiedInput: null,

    initPreviewTab() {
        this.preview = document.getElementById('file-preview');
    },

    init() {

        this.info = document.getElementById('file-info');
        this.preview = document.getElementById('file-preview');
        this.fileTagsTree = document.getElementById('file-tags-container');

        this.fileNameInput = document.getElementById('file-name');
        this.fileNameSaveButton = document.getElementById('file-name-save');
        this.filePathInput = document.getElementById('file-path');
        this.fileIdInput = document.getElementById('file-id');
        this.fileSizeInput = document.getElementById('file-size');
        this.fileCreatedInput = document.getElementById('file-creation-date');
        this.fileModifiedInput = document.getElementById('file-modified-date');
    },

    getFileNameValue() {
        return this.fileNameInput.value;
    },

    setFilePathValue(path) {
        this.filePathInput.value = path;
    },

    setFileInfo(file) {
        this.fileNameInput.value = file.name || '';
        this.filePathInput.value = file.path || '';
        this.fileIdInput.value = file.id || '';
        this.fileSizeInput.value = formatSize(file.size) || '';
        this.fileCreatedInput.value = formatBirthtime(file.created_at) || '';
        this.fileModifiedInput.value = formatBirthtime(file.last_modified) || '';
        this.resizeFileInputs();
    },

    clearFileInfo() {
        this.fileNameInput.value = '';
        this.filePathInput.value = '';
        this.fileIdInput.value = '';
        this.fileSizeInput.value = '';
        this.fileCreatedInput.value = '';
        this.fileModifiedInput.value = '';
        this.resizeFileInputs();
    },

    resizeFileInputs() {
        inputAutoResize(this.fileIdInput);
        inputAutoResize(this.fileSizeInput);
        inputAutoResize(this.fileCreatedInput);
        inputAutoResize(this.fileModifiedInput);
        inputAutoResize(this.filePathInput);
        inputAutoResize(this.fileNameInput);
    },

    resizeFileNameInput() {
        inputAutoResize(this.fileNameInput);
    },

    clearTags() {
        this.fileTagsTree.innerHTML = '';
    },

    clearPreview() {
        if (!this.preview) this.init();

        this.preview.innerHTML = '';
        this.preview.dataset.i18n = '';
        this.preview.textContent = '';
    },

    renderImage(file) {
        const img = document.createElement('img');
        img.src = file.path;
        img.alt = file.name || '';
        img.className = 'file-preview-image';
        this._prepareElement(img);
        this.preview.appendChild(img);
        return img;
    },

    renderVideo(file, settings) {
        const video = document.createElement('video');
        video.src = file.path;
        video.controls = true;
        video.autoplay = settings.vidAutoplay;
        video.loop = settings.vidLoop;
        video.className = 'file-preview-video';
        this._prepareElement(video);
        this.preview.appendChild(video);
        return video;
    },

    setError(i18nKey, text) {
        this.clearPreview();
        this.preview.dataset.i18n = i18nKey;
        this.preview.textContent = text;
    },

    // Helpers used by controller for transforms/positioning
    _prepareElement(el) {
        // Make element absolutely positioned inside preview container
        el.style.position = 'absolute';
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.transform = 'translate(-50%, -50%) scale(1)';
        el.style.cursor = 'grab';
        el.draggable = false;
        el.setAttribute('tabindex', '-1');
        // ensure preview container is positioned
        if (this.preview) {
            const cs = getComputedStyle(this.preview);
            if (cs.position === 'static') {
                this.preview.style.position = 'relative';
            }
        }
    },

    setTransform(el, scale) {
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
    },

    setPosition(el, leftPx, topPx) {
        el.style.left = `${leftPx}px`;
        el.style.top = `${topPx}px`;
    },

    resetPosition(el) {
        el.style.left = '50%';
        el.style.top = '50%';
    },

    setTagsTreeWidth(px) {
        this.fileTagsTree.style.width = px + 'px';
    },

    getTagsTreeParentRect() {
        return this.fileTagsTree.parentElement.getBoundingClientRect();
    },

    setBodyCursor(cursor) {
        document.body.style.cursor = cursor;
    },

    hideFileNameSaveButton() {
        this.fileNameSaveButton.disabled = true;
    },

    showFileNameSaveButton() {
        this.fileNameSaveButton.disabled = false;
    },

    onFileNameSaveClick(handler) {
        this.fileNameSaveButton.addEventListener('click', handler);
    },

    onFileNameInput(handler) {
        this.fileNameInput.addEventListener('input', handler);
    },
};