const rightSidebar = document.getElementById('right-sidebar');
const rightSidebarItems = document.querySelectorAll(".right-sidebar-item");
const toggleSidebar = document.getElementById("toggle-file-sidebar");

const fileInfoSection = document.getElementById('file-info');
const fileTagsSection = document.getElementById('file-container');

let fileInfoSectionIsHidden = false;
let fileTagsSectionIsHidden = false;

function setToggleButtonIcon(isHidden) {
    toggleSidebar.style.backgroundImage = isHidden
        ? "url('images/left-arrow.png')"
        : "url('images/right-arrow.png')";
}

export const rightSidebarView = {

    showPanel() {
        const isHidden = rightSidebar.classList.contains("hidden");
        setToggleButtonIcon(isHidden);

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
    },

    getMenuElements() {
        return menuElements;
    },

    toggleSidebar() {
        const isHidden = rightSidebar.classList.toggle("hidden");

        this.showPanel();

        return isHidden;
    },

    onToggleSidebarClick(handler) {
        toggleSidebar.addEventListener('click', () => handler());
    },
};