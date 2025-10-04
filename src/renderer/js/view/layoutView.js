const leftSidebar = document.getElementById("left-sidebar");
const rightSidebar = document.getElementById("right-sidebar");
const content = document.getElementById("content");

export const layoutView = {

    render(state) {
        leftSidebar.style.width = state.leftHidden ? "0%" : `${state.leftWidth}%`;
        rightSidebar.style.width = state.rightHidden ? "0%" : `${state.rightWidth}%`;
        content.style.width = `${state.contentWidth}%`;

        leftSidebar.classList.toggle("hidden", state.leftHidden);
        rightSidebar.classList.toggle("hidden", state.rightHidden);
    }
}
