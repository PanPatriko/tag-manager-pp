let modalMode = null;

let tagToEdit = null;
let selectedParentTag = null;

let locationToEdit = null;

export const modalModel = { 

    get modalMode() { return modalMode; },
    set modalMode(mode) { modalMode = mode; },

    get tagToEdit() { return tagToEdit; },
    set tagToEdit(tag) { tagToEdit = tag; },

    get selectedParentTag() { return selectedParentTag; },
    set selectedParentTag(tag) { selectedParentTag = tag; },

    get locationToEdit() { return locationToEdit; },
    set locationToEdit(location) { locationToEdit = location; }
}

export class TagModalState {
  constructor({ title, tagColor, tagTextColor, tagHierarchy = null, tagName = null }) {
    this.title = title;
    this.tagColor = tagColor;
    this.tagTextColor = tagTextColor;
    this.tagHierarchy = tagHierarchy;
    this.tagName = tagName;
  }
}

export class LocationModalState {
  constructor({ title, name, path }) {
    this.title = title;
    this.name = name;
    this.path = path;
  }
}

export const ModalMode = Object.freeze({
    NEW: 'new',
    EDIT: 'edit'
});