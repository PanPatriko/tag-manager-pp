import { i18nModel } from "../model/i18nModel.js";
import { settingsModel } from '../model/settingsModel.js';
import { tagsModel } from '../model/tagsModel.js';
import { modalModel, ModalMode, TagModalState } from '../model/modalModel.js';

import { tagsModalView } from '../view/tagsModalView.js';
import { tagsView } from '../view/tagsView.js';

import { tagsController } from './tagsController.js';

import { highlightText } from '../utils.js';

export const tagsModalController = {

    init() {
        tagsModalView.init();

        tagsView.onAddTagClick(() => { this.openNewTagModal(); })
        tagsModalView.onCancelClick(closeModal);

        tagsModalView.onOkClick(saveTag);

        tagsModalView.onClearParentTagClick(() => {
            modalModel.selectedParentTag = null;
            tagsModalView.clearParentTag();
        });

        tagsModalView.onParentTagNameInput(() => {
            const query = tagsModalView.getParentTagNameValue();
            if (query.length > 0) {
                searchParentTag(query);
            } else {
                tagsModalView.hideParentSuggestions();
            }
        });

        tagsModalView.onParentTagNameFocus(() => {
            const query = tagsModalView.getParentTagNameValue();
            if (query.length > 0) {
                tagsModalView.showParentSuggestions();
            }
        });

        tagsModalView.onParentTagNameBlur(() => {
            setTimeout(() => {
                tagsModalView.hideParentSuggestions();
            }, 200);
        });
    },

    openNewTagModal(parentTag) {
        openTagModal({ mode: ModalMode.NEW, parentTag });
    },

    openEditTagModal(tag) {
        openTagModal({ mode: ModalMode.EDIT, tag });
    }

}

function closeModal() {
    modalModel.tagToEdit = null;
    modalModel.selectedParentTag = null;
    tagsModalView.closeModal();
}

async function saveTag() {
    const tagName = tagsModalView.getTagNameValue();
    const tagNames = tagName.trim().split(',').map(tag => tag.trim());

    if (tagNames.length === 0 || tagNames[0] === '') {
        showPopup(i18nModel.t('tag-alert-empty-name'), 'warning');
        return;
    }

    const color = tagsModalView.getTagColorValue();
    const textColor = tagsModalView.getTagTextColorValue();
    const parentId = modalModel.selectedParentTag ? modalModel.selectedParentTag.id : null;

    if (modalModel.modalMode === ModalMode.EDIT) {
        await tagsModel.updateTag(modalModel.tagToEdit.id, tagName, parentId, color, textColor);
    } else if (modalModel.modalMode === ModalMode.NEW) {
        for (const tagName of tagNames) {
            await tagsModel.createTag(tagName, parentId, color, textColor);
        }
    } else {
        console.error('saveTag: Unknown modal mode:', modalModel.modalMode);
    }

    tagsController.refreshTagsContainer();
    closeModal();
}

function handleParentTagSelection(tag, hierarchy) {
    if (tagsModel.isDescendantTag(modalModel.tagToEdit, tag)) {
        showPopup(i18nModel.t('tag-alert-not-allowed-parent-tag'), 'warning');
        return;
    }

    modalModel.selectedParentTag = tag;
    tagsModalView.clearParentTag();
    tagsModalView.setSelectedParentTag(hierarchy);
    tagsModalView.hideParentSuggestions();
}

function searchParentTag(query) {
    const matchingTags = tagsModel.searchTags(query, 'startsWith');
    tagsModalView.clearParentSuggestions();

    if (matchingTags.length === 0) {
        tagsModalView.hideParentSuggestions();
        return;
    }

    tagsModalView.showParentSuggestions();

    matchingTags.forEach(tag => {
        const hierarchy = tagsModel.buildSingleTagHierarchy(tag);
        const li = tagsModalView.renderParentSuggestion(hierarchy);

        li.addEventListener('click', () => handleParentTagSelection(tag, hierarchy));
    });

    highlightText(query, 'parent-name-suggestions', 'li span:last-child');
}

function openTagModal({ mode, tag = null, parentTag = null }) {
    modalModel.modalMode = mode;

    let title, tagName, tagColor, tagTextColor, tagHierarchy;

    if (mode === ModalMode.NEW) {
        modalModel.selectedParentTag = parentTag;

        title = i18nModel.t('tag-add');
        if(parentTag) {
            tagHierarchy = tagsModel.buildSingleTagHierarchy(parentTag);
            tagColor = parentTag.color;
            tagTextColor = parentTag.textColor;
                
        } else {
            tagHierarchy = null;
            tagColor = settingsModel.defTagBgColor;
            tagTextColor = settingsModel.defTagTextColor;
        }
    }

    if (mode === ModalMode.EDIT) {
        modalModel.tagToEdit = tag;
        const parent = tagsModel.findTagById(tag.parentId);
        modalModel.selectedParentTag = parent;

        title = i18nModel.t('tag-edit');
        tagName = tag.name;
        tagColor = tag.color;
        tagTextColor = tag.textColor;
        tagHierarchy = parent ? tagsModel.buildSingleTagHierarchy(parent) : null;
    }

    const tagModalState = new TagModalState({ title, tagName, tagColor, tagTextColor, tagHierarchy });
    tagsModalView.openModal(tagModalState);
}
