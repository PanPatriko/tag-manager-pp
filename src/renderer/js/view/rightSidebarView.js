let fileInfoSectionIsHidden = false;
let fileTagsSectionIsHidden = false;

export const rightSidebarView = {

    rightSidebar: null,
    rightSidebarItems: null,
    rightSidebarToggle: null,
    fileInfoSection: null,
    fileTagsSection: null,

    init() {
        this.rightSidebar = document.getElementById('right-sidebar');
        this.rightSidebarItems = document.querySelectorAll(".right-sidebar-item");
        this.rightSidebarToggle = document.getElementById("toggle-file-sidebar");
        this.fileInfoSection = document.getElementById('file-info');
        this.fileTagsSection = document.getElementById('file-container');
    },

    showPanel() {
        const isHidden = this.rightSidebar.classList.contains("hidden");
        this.setToggleButtonIcon(isHidden);

        if (isHidden) {
            fileInfoSectionIsHidden = this.fileInfoSection.classList.contains("hidden");
            fileTagsSectionIsHidden = this.fileTagsSection.classList.contains("hidden");

            this.rightSidebarItems.forEach(item => {
                item.classList.add("hidden");
            });

            const videos = document.querySelectorAll('.file-preview-video');
            videos.forEach(video => {
                video.pause();
            });
        } else {
            this.rightSidebarItems.forEach(item => {
                item.classList.remove("hidden");
            });
            if (fileInfoSectionIsHidden) {
                this.fileInfoSection.classList.add("hidden");
            }
            if (fileTagsSectionIsHidden) {
                this.fileTagsSection.classList.add("hidden");
            }
        }
    },

    getMenuElements() {
        return this.menuElements;
    },

    setToggleButtonIcon(isHidden) {
        this.rightSidebarToggle.style.backgroundImage = isHidden
            ? "url('images/left-arrow.png')"
            : "url('images/right-arrow.png')";
    },

    toggleSidebar() {
        const isHidden = this.rightSidebar.classList.toggle("hidden");
        this.showPanel();
        return isHidden;
    },

    onToggleSidebarClick(handler) {
        this.rightSidebarToggle.addEventListener('click', () => handler());
    },
}
