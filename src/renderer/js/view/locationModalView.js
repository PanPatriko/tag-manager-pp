export const locationModalView = {
    modal: null,
    title: null,
    name: null,
    path: null,

    init() {
        this.modal = document.getElementById('location-form-modal');
        this.title = document.getElementById('loc-modal-title');
        this.name = document.getElementById('loc-name');
        this.path = document.getElementById('loc-path');
    },

    getNameValue() { return this.name.value.trim(); },

    getPathValue() { return this.path.value.trim(); },

    setPathValue(directoryPath) {
        this.path.value = directoryPath;
    }, 

    openModal(locationModalState) {
        this.title.innerText = locationModalState.title;
        this.name.value = locationModalState.name;
        this.path.value = locationModalState.path;
        this.modal.classList.remove('hidden');
    },

    closeModal() {
        this.modal.classList.add('hidden');
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
        this.modal.querySelector('.modal-close').addEventListener('click', () => handler());
    }
}
