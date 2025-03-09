import { updateContentWidth } from "../content/content.js";

const sidebar = document.getElementById('right-sidebar');
const toggleRightSidebarButton = document.getElementById("toggle-file-sidebar");
const rightSidebarItems = document.querySelectorAll(".right-sidebar-item");
const resizeHandle = document.getElementById('right-resize-handle');

const fileInfoSection = document.getElementById('file-info');
const fileTagsSection = document.getElementById('file-tags');

let fileInfoSectionIsHidden = false;
let fileTagsSectionIsHidden = false;

let startX, startWidth, lastSidebarWidth = 30;

toggleRightSidebarButton.addEventListener("click", () => {
    const isHidden = sidebar.classList.toggle("hidden");
    toggleRightSidebarButton.style.backgroundImage = isHidden ? "url('images/left-arrow.png')" : "url('images/right-arrow.png')";
        
    if (isHidden) {
        
        fileInfoSectionIsHidden = fileInfoSection.classList.contains("hidden");
        fileTagsSectionIsHidden = fileTagsSection.classList.contains("hidden");

        rightSidebarItems.forEach(item => {
            item.classList.add("hidden");
        });      

        const videos = document.querySelectorAll('.file-preview-video');
        videos.forEach(video => {
            video.pause();
        });
    } else {
        rightSidebarItems.forEach(item => {
            item.classList.remove("hidden");
        });
        if (fileInfoSectionIsHidden) {
            fileInfoSection.classList.add("hidden");
        }
        if (fileTagsSectionIsHidden) {
            fileTagsSection.classList.add("hidden");
        }
    }

    sidebar.style.width = isHidden ? "0" : `${lastSidebarWidth}%`;
    updateContentWidth();
});

resizeHandle.addEventListener('mousedown', function(e) {
    e.preventDefault();
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    sidebar.style.transition = 'none';
    document.addEventListener('mousemove', resizeSidebar);
    document.addEventListener('mouseup', stopResizing);
});

function resizeSidebar(e) {
    const newWidth = startWidth - (e.clientX - startX);
    const screenWidth = window.innerWidth;
    const newWidthPercent = Math.min(Math.round((newWidth / screenWidth) * 100), 100);
    sidebar.style.width = `${newWidthPercent}%`;
    lastSidebarWidth = newWidthPercent;
    updateContentWidth();
}

function stopResizing() {
    sidebar.style.transition = 'transform 1s ease, width 1s ease';
    document.removeEventListener('mousemove', resizeSidebar);
    document.removeEventListener('mouseup', stopResizing);
}