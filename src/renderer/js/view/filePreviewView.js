export const filePreviewView = {
    showInfo: null,
    showTags: null,
    showPreview: null,

    info: null,
    preview: null,
    fileTagsTree: null,

    resizeHandle: null,

    fileNameInput: null,
    fileNameSaveButton: null,
    filePathInput: null,
    fileIdInput: null,
    fileSizeInput: null,
    fileCreatedInput: null,

    initPreviewTab() {
        this.preview = document.getElementById('file-preview');
    },

    init() {
        this.showInfo = document.getElementById('show-file-info');
        this.showTags = document.getElementById('show-file-tags');
        this.showPreview = document.getElementById('show-file-prev');

        this.info = document.getElementById('file-info');
        this.preview = document.getElementById('file-preview');
        this.fileTagsTree = document.getElementById('file-tags-container');

        this.resizeHandle = document.getElementById('file-container-resize-handle');

        this.fileNameInput = document.getElementById('file-name');
        this.fileNameSaveButton = document.getElementById('file-name-save');
        this.filePathInput = document.getElementById('file-path');
        this.fileIdInput = document.getElementById('file-id');
        this.fileSizeInput = document.getElementById('file-size');
        this.fileCreatedInput = document.getElementById('file-creation-date');
    },

    getFileNameValue() {
        return this.fileNameInput.value;
    },

    setFilePathValue(path) {
        this.filePathInput.value = path;
    },

    toggleFileInfoSection() {
        this.info.classList.toggle('hidden');
        this.showInfo.classList.toggle('active');
    },

    toggleFileTagsSection() {
        this.fileTagsTree.classList.toggle('hidden');
        this.showTags.classList.toggle('active');
        this.updateResizeHandle();
    },

    toggleFilePreviewSection() {
        this.preview.classList.toggle('hidden');
        this.showPreview.classList.toggle('active');
        if (preview.classList.contains('hidden')) {
            this.fileTagsTree.style.width = '100%';
            const videos = document.querySelectorAll('.file-preview-video');
            videos.forEach(video => {
                video.pause();
            });
        } else {
            this.fileTagsTree.style.width = '250px';
        }
        this.updateResizeHandle();
    },

    updateResizeHandle() {
        if (this.preview.classList.contains('hidden') && this.fileTagsTree.classList.contains('hidden')) {
            this.resizeHandle.classList.add('hidden');
        } else {
            this.resizeHandle.classList.remove('hidden');
        }
    },

    setFileInfo(file) {
        this.fileNameInput.value = file.name || "";
        this.filePathInput.value = file.path || "";
        this.fileIdInput.value = file.id || '';
        this.fileSizeInput.value = file.size || '';
        this.fileCreatedInput.value = file.createdAt || '';
        this.resizeFileInputs();
    },

    clearFileInfo() {
        this.fileNameInput.value = '';
        this.filePathInput.value = '';
        this.fileIdInput.value = '';
        this.fileSizeInput.value = '';
        this.fileCreatedInput.value = '';
        this.resizeFileInputs();
    },

    resizeFileInputs() {
        autoResize(this.fileIdInput);
        autoResize(this.fileSizeInput);
        autoResize(this.fileCreatedInput);
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
        this.fileNameSaveButton.hidden = true;
    },

    showFileNameSaveButton() {
        this.fileNameSaveButton.hidden = false;
    },

    onResizeStart(handler) {
        this.resizeHandle.addEventListener('mousedown', handler);
    },

    onFileNameSaveClick(handler) {
        this.fileNameSaveButton.addEventListener('click', handler);
    },

    onFileNameSaveMouseEnter(handler) {
        this.fileNameSaveButton.addEventListener('mouseenter', handler);
    },

    onFileNameSaveMouseLeave(handler) {
        this.fileNameSaveButton.addEventListener('mouseleave', handler);
    },

    onFileNameInputFocus(handler) {
        this.fileNameInput.addEventListener('focus', handler);
    },

    onFileNameInputFocusOut(handler) {
        this.fileNameInput.addEventListener('focusout', handler);
    },

    onShowInfoClick(handler) {
        this.showInfo.addEventListener('click', handler);
    },

    onShowTagsClick(handler) {
        this.showTags.addEventListener('click', handler);
    },

    onShowPreviewClick(handler) {
        this.showPreview.addEventListener('click', handler);
    }
};

function autoResize(input) {
    input.style.width = (input.value.length + 2) + 'ch';
}