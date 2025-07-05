import { showPanel } from '../leftSidebar/leftSidebar.js';

const content = document.getElementById('content');

const rightSidebar = document.getElementById('right-sidebar');
const toggleRightSidebarButton = document.getElementById("toggle-file-sidebar");
const rightSidebarItems = document.querySelectorAll(".right-sidebar-item");
const rightResizeHandle = document.getElementById('right-resize-handle');

const fileInfoSection = document.getElementById('file-info');
const fileTagsSection = document.getElementById('file-container');

const leftSidebar = document.getElementById("left-sidebar");
const toggleLeftSidebar = document.getElementById("toggle-tag-sidebar");
const leftSidebarItems = document.querySelectorAll(".left-sidebar-item");
const leftResizeHandle = document.getElementById('left-resize-handle');

let fileInfoSectionIsHidden = false;
let fileTagsSectionIsHidden = false;
let lastRightSidebarWidth = 20;
let lastLeftSidebarWidth = 20;

let isResizingLeft = false;
let isResizingRight = false;
let startX = 0;
let startLeftWidth = 0;
let startMiddleWidth = 0;
let startRightWidth = 0;

const MIN_SIDEBARS_WIDTH = 10;
const MIN_CONTENT_WIDTH = 15;

leftResizeHandle.addEventListener('mousedown', (e) => startResizing(e, 'left'));
rightResizeHandle.addEventListener('mousedown', (e) => startResizing(e, 'right'));

toggleRightSidebarButton.addEventListener("click", () => {
    const isHidden = rightSidebar.classList.toggle("hidden");
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

    updateContentWidth();
    saveSidebarState();
});

toggleLeftSidebar.addEventListener("click", () => {
    const isHidden = leftSidebar.classList.toggle("hidden");
    toggleLeftSidebar.style.backgroundImage = isHidden ? "url('images/right-arrow.png')" : "url('images/left-arrow.png')";

    if (isHidden) {
        leftSidebarItems.forEach(item => {
            if (!item.classList.contains("hidden")) {
                item.classList.toggle("hidden");
            }
        });
    } else {
        const activePanel = localStorage.getItem('activePanel');
        if (activePanel) {
            showPanel(activePanel);
        } else {
            showPanel('settings-panel');
        }
    }

    updateContentWidth();
    saveSidebarState();
});

function startResizing(e, direction) {
    e.preventDefault();
    startX = e.clientX;
    startLeftWidth = leftSidebar.classList.contains('hidden') ? 0 : getComputedWidth(leftSidebar);
    startMiddleWidth = getComputedWidth(content);
    startRightWidth = rightSidebar.classList.contains('hidden') ? 0 : getComputedWidth(rightSidebar);

    if (direction === 'left') {
        isResizingLeft = true;
    } else if (direction === 'right') {
        isResizingRight = true;
    }

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
}

function resize(e) {
    let newMiddleWidth = MIN_CONTENT_WIDTH;
    if (isResizingLeft) {
        const deltaX = (e.clientX - startX) / window.innerWidth * 100;
        const newLeftWidth = Math.max(MIN_SIDEBARS_WIDTH, Math.round(startLeftWidth + deltaX));
        newMiddleWidth = Math.max(MIN_CONTENT_WIDTH, Math.round(startMiddleWidth - deltaX));
        const totalWidth = newLeftWidth + newMiddleWidth + startRightWidth;

        if (newMiddleWidth >= MIN_CONTENT_WIDTH && totalWidth <= 100) {
            leftSidebar.style.width = `${newLeftWidth}%`;
            content.style.width = `${newMiddleWidth}%`;
            lastLeftSidebarWidth = newLeftWidth;
            //rightSidebar.style.width = `${Math.round(100 - newLeftWidth - newMiddleWidth)}%`;
        } 
        

    } else if (isResizingRight) {
        const deltaX = (startX - e.clientX) / window.innerWidth * 100;
        const newRightWidth = Math.max(MIN_SIDEBARS_WIDTH, Math.round(startRightWidth + deltaX));
        newMiddleWidth = Math.max(MIN_CONTENT_WIDTH, Math.round(startMiddleWidth - deltaX));
        const totalWidth = startLeftWidth + newMiddleWidth + newRightWidth;

        if (newMiddleWidth >= MIN_CONTENT_WIDTH && totalWidth <= 100) {
            rightSidebar.style.width = `${newRightWidth}%`;
            content.style.width = `${newMiddleWidth}%`;
            lastRightSidebarWidth = newRightWidth;
            //leftSidebar.style.width = `${Math.round(100 - newMiddleWidth - newRightWidth)}%`;
        } 
    }
    
    saveSidebarState();

}

function stopResizing() {
    isResizingLeft = false;
    isResizingRight = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResizing);
}

function updateContentWidth() {
    const leftSidebarWidth = leftSidebar.classList.contains('hidden') ? 0 : lastLeftSidebarWidth;
    const rightSidebarWidth = rightSidebar.classList.contains('hidden') ? 0 : lastRightSidebarWidth;

    let contentWidth = 100 - leftSidebarWidth - rightSidebarWidth;

    if (contentWidth < MIN_CONTENT_WIDTH) {
        const excessWidth = MIN_CONTENT_WIDTH - contentWidth;

        if (!leftSidebar.classList.contains('hidden') && leftSidebarWidth > MIN_SIDEBARS_WIDTH) {
            const leftAdjustment = Math.min(excessWidth, leftSidebarWidth - MIN_SIDEBARS_WIDTH);
            lastLeftSidebarWidth -= leftAdjustment;
            contentWidth += leftAdjustment;
        }

        if (contentWidth < MIN_CONTENT_WIDTH && !rightSidebar.classList.contains('hidden') && rightSidebarWidth > MIN_SIDEBARS_WIDTH) {
            const rightAdjustment = Math.min(excessWidth, rightSidebarWidth - MIN_SIDEBARS_WIDTH);
            lastRightSidebarWidth -= rightAdjustment;
            contentWidth += rightAdjustment;
        }
    }

    leftSidebar.style.width = leftSidebar.classList.contains('hidden') ? "0%" : `${lastLeftSidebarWidth}%`;
    rightSidebar.style.width = rightSidebar.classList.contains('hidden') ? "0%" : `${lastRightSidebarWidth}%`;
    content.style.width = `${contentWidth}%`;
}

function getComputedWidth(element) {
    return Math.round(parseFloat(getComputedStyle(element).width) / window.innerWidth * 100);
}

function saveSidebarState() {
    localStorage.setItem('leftSidebarWidth', lastLeftSidebarWidth);
    localStorage.setItem('rightSidebarWidth', lastRightSidebarWidth);
    localStorage.setItem('leftSidebarHidden', leftSidebar.classList.contains('hidden'));
    localStorage.setItem('rightSidebarHidden', rightSidebar.classList.contains('hidden'));
}

export function restoreSidebarState() {
    const leftWidth = parseInt(localStorage.getItem('leftSidebarWidth'), 10);
    const rightWidth = parseInt(localStorage.getItem('rightSidebarWidth'), 10);
    const leftHidden = localStorage.getItem('leftSidebarHidden') === 'true';
    const rightHidden = localStorage.getItem('rightSidebarHidden') === 'true';

    if (!isNaN(leftWidth)) lastLeftSidebarWidth = leftWidth;
    if (!isNaN(rightWidth)) lastRightSidebarWidth = rightWidth;

    leftSidebar.style.width = leftHidden ? "0%" : `${lastLeftSidebarWidth}%`;
    rightSidebar.style.width = rightHidden ? "0%" : `${lastRightSidebarWidth}%`;

    if (leftHidden) leftSidebar.classList.add('hidden');
    else leftSidebar.classList.remove('hidden');

    if (rightHidden) rightSidebar.classList.add('hidden');
    else rightSidebar.classList.remove('hidden');

    updateContentWidth();
}