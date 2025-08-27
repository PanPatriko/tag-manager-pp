export const locationModalView = {
    get locationModal() { return document.getElementById('location-form-modal'); },

    get modalTitle() { return document.getElementById('loc-modal-title');},

    get nameInput() { return document.getElementById('loc-name'); },

    get pathInput() { return document.getElementById('loc-path'); },

    get pathBrowseButton() { return document.getElementById('loc-path-btn'); },

    get okButton() { return document.getElementById('loc-modal-ok'); },

    get cancelButton() { return document.getElementById('loc-modal-cancel'); },
}