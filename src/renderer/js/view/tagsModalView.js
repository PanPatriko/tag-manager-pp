export const tagsModalView = {
    get tagModal() { return document.getElementById('tag-form-modal'); },

    get modalTitle() { return document.getElementById('tag-modal-title');},

    get tagName() { return document.getElementById('tag-name'); },

    get parentTagName() { return document.getElementById('parent-name'); },

    get tagColor() { return document.getElementById('color'); },

    get tagTextColor() { return document.getElementById('textcolor'); },

    get parentTagLabel() { return document.getElementById('parent-tag'); },

    get cancelButton() { return document.getElementById('tag-modal-cancel'); },
    
    get okButton() { return document.getElementById('tag-modal-ok'); },

    get clearParentTagButton() { return document.getElementById('clear-parent-tag'); },

    get parentNameSuggestions() { return document.getElementById('parent-name-suggestions'); }
}