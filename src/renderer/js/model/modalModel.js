let modalMode = null;

let tagToEdit = null;
let selectedParentTag = null;

let locationToEdit = null;

let tagIds = [];

export const modalModel = { 

  get modalMode() { return modalMode; },
  set modalMode(mode) { modalMode = mode; },

  get tagToEdit() { return tagToEdit; },
  set tagToEdit(tag) { tagToEdit = tag; },

  get selectedParentTag() { return selectedParentTag; },
  set selectedParentTag(tag) { selectedParentTag = tag; },

  get locationToEdit() { return locationToEdit; },
  set locationToEdit(location) { locationToEdit = location; },

  get tagIds() { return tagIds; },
  set tagIds(ids) { tagIds = ids; },

  canAddTag(id) {
    return !tagIds.includes(id);
  },

  addTagId(tagId) {
    tagIds.push(tagId);
  },

  removeTagId(tagId) {
    tagIds = tagIds.filter(id => id !== tagId);
  },

  isTagIdsEmpty() {
    return tagIds.length === 0;
  }
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