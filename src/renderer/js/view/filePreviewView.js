export const filePreviewView = {
    preview: null,

    init() {
        this.preview = document.getElementById('file-preview');
    },

    clear() {
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
        this.clear();
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
    }
};