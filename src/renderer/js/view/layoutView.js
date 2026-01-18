export const layoutView = {
    leftSidebar: null,
    rightSidebar: null,
    content: null,

    init() {
        this.leftSidebar = document.getElementById("left-sidebar");
        this.rightSidebar = document.getElementById("right-sidebar");
        this.content = document.getElementById("content");
    },

    render(state) {
        this.leftSidebar.style.width = state.leftHidden ? "0%" : `${state.leftWidth}%`;
        this.rightSidebar.style.width = state.rightHidden ? "0%" : `${state.rightWidth}%`;
        this.content.style.width = `${state.contentWidth}%`;

        this.leftSidebar.classList.toggle("hidden", state.leftHidden);
        this.rightSidebar.classList.toggle("hidden", state.rightHidden);
    }
}
