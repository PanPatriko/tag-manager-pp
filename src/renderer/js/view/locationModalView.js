const modal = document.getElementById('location-form-modal');
const title = document.getElementById('loc-modal-title');
const name = document.getElementById('loc-name');
const path = document.getElementById('loc-path');

export const locationModalView = {

    getNameValue() { return name.value.trim(); },

    getPathValue() { return path.value.trim(); },

    setPathValue(directoryPath) {
        path.value = directoryPath;
    }, 

    openModal(locationModalState) {
        title.innerText = locationModalState.title;
        name.value = locationModalState.name;
        path.value = locationModalState.path;
        modal.classList.remove('hidden');
    },

    closeModal() {
        modal.classList.add('hidden');
    },

    onBrowseClick(handler) {
        const el = document.getElementById('loc-path-btn');
        el.addEventListener('click', () => handler());
    },

    onOkClick(handler) {
        const el = document.getElementById('loc-modal-ok');
        el.addEventListener('click', () => handler());
    },

    onCancelClick(handler) {
        const el = document.getElementById('loc-modal-cancel');
        el.addEventListener('click', () => handler());
        modal.querySelector('.modal-close').addEventListener('click', () => handler());
    }
}