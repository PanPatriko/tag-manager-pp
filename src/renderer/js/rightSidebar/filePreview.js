import { vidLoop, vidAutoplay, setCurrentFile } from "../state.js";
import { renderFileInfo } from "./fileInfo.js";

const preview = document.getElementById('file-preview');

let isDragging = false;
let startX, startY, initialX, initialY;
let scale = 1;

export async function createFilePreview(file) {
    preview.innerHTML = ''; 

    if(await window.api.fileExists(file.path)) {
        if (file.path.match(/\.(jpg|jpeg|png|gif)$/i)) {
            const img = document.createElement('img');
            img.src = file.path;
            img.alt = file.name;
            img.className = 'file-preview-image';
            addListener(img);   
            preview.appendChild(img);  
        } else if (file.path.match(/\.(mp4|webm|ogg)$/i)) {
            const video = document.createElement('video');
            video.src = file.path;
            video.controls = true;
            video.autoplay = vidAutoplay;
            video.loop = vidLoop;
            video.className = 'file-preview-video';
            addListener(video); 
            preview.appendChild(video);
        } else {
            preview.dataset.i18n = "file-prev-format-error";
            preview.textContent = window.translations['file-prev-format-error'];
        }
    } else {
        preview.dataset.i18n = "content-deleted-file";
        preview.textContent = window.translations['content-deleted-file'];
    }
    setCurrentFile(file);
    renderFileInfo(file);
}

function addListener(element) {   
    element.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (e.deltaY < 0) {
            scale += 0.1;
        } else {
            scale -= 0.1;
            if (scale < 0.1) scale = 0.1;
        }
        element.style.transform = `translate(-50%, -50%) scale(${scale})`;
    });
    
    element.addEventListener('dblclick', function() {
        scale = 1;
        element.style.transform = `translate(-50%, -50%) scale(${scale})`;
        element.style.left = '50%';
        element.style.top = '50%';
    });

    element.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = element.offsetLeft;
        initialY = element.offsetTop;
        element.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.left = `${initialX + dx}px`;
            element.style.top = `${initialY + dy}px`;
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        element.style.cursor = 'grab';
    });
}