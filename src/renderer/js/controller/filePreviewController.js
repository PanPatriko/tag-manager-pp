import { settingsModel } from '../model/settingsModel.js';
import { i18nModel } from '../model/i18nModel.js';

import { filePreviewView } from '../view/filePreviewView.js';

let currentDetach = null;

export async function createFilePreview(file) {
    // detach previous listeners
    if (typeof currentDetach === 'function') {
        currentDetach();
        currentDetach = null;
    }

    filePreviewView.init();
    filePreviewView.clear();

    if (!file || !file.path) {
        // nothing to render
        return;
    }

    if (!await window.api.fileExists(file.path)) {
        filePreviewView.setError('content-deleted-file', i18nModel.t('content-deleted-file'));
        return;
    }

    const imgRegex = /\.(jpg|jpeg|png|gif)$/i;
    const vidRegex = /\.(mp4|webm|ogg)$/i;

    try {
        let el = null;
        if (imgRegex.test(file.path)) {
            el = filePreviewView.renderImage(file);
        } else if (vidRegex.test(file.path)) {
            el = filePreviewView.renderVideo(file, settingsModel);
        } else {
            filePreviewView.setError('file-prev-format-error', i18nModel.t('file-prev-format-error'));
            return;
        }

        // attach interactions and keep a detach function
        currentDetach = attachInteractions(el);
    } catch (err) {
        console.error('createFilePreview error', err);
        filePreviewView.setError('file-prev-format-error', i18nModel.t('file-prev-format-error'));
    }
}

function attachInteractions(element) {
    let scale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialX = 0, initialY = 0;

    // For consistent removal we declare handlers as named functions
    const onWheel = (e) => {
        e.preventDefault();
        scale += (e.deltaY < 0) ? 0.1 : -0.1;
        if (scale < 0.1) scale = 0.1;
        filePreviewView.setTransform(element, scale);
    };

    const onDblClick = () => {
        scale = 1;
        filePreviewView.setTransform(element, scale);
        filePreviewView.resetPosition(element);
    };

    const onMouseDown = (e) => {
        // only left button
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        // offsetLeft/Top are relative to offsetParent (preview)
        initialX = element.offsetLeft;
        initialY = element.offsetTop;
        element.style.cursor = 'grabbing';
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        filePreviewView.setPosition(element, initialX + dx, initialY + dy);
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        element.style.cursor = 'grab';
    };

    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('dblclick', onDblClick);
    element.addEventListener('mousedown', onMouseDown);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Return a detach function to remove handlers when preview changes
    return function detach() {
        element.removeEventListener('wheel', onWheel);
        element.removeEventListener('dblclick', onDblClick);
        element.removeEventListener('mousedown', onMouseDown);

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
}