import { highlightText } from '../utils.js';

import { i18nModel } from "../model/i18nModel.js";
import { settingsModel } from '../model/settingsModel.js';
import { tagsModel, TagType, TagClass } from '../model/tagsModel.js';
import { modalModel, ModalMode } from '../model/modalModel.js';
import { refreshTagsContainer } from './tagsController.js';
import { tagsModalView } from '../view/tagsModalView.js';
import { tagsView } from '../view/tagsView.js';

function _closeModal() {
    modalModel.tagToEdit = null;
    modalModel.selectedParentTag = null;
    tagsModalView.parentTagLabel.innerHTML = '';      
    tagsModalView.parentTagName.value = '';
    tagsModalView.tagModal.classList.add('hidden');
}

async function _saveTag() {
    const tagNames = tagsModalView.tagName.value.trim().split(',').map(tag => tag.trim());

    if (tagNames.length === 0 || tagNames[0] === '') {
        showPopup(i18nModel.t('tag-alert-empty-name-title'), 
            i18nModel.t('tag-alert-empty-name'), 'warning');
        return;
    }

    const color = tagsModalView.tagColor.value; // TODO Pobrac z modelu a nie z view ??
    const textcolor = tagsModalView.tagTextColor.value;
    const parentId = modalModel.selectedParentTag ? modalModel.selectedParentTag.id : null;

    if (modalModel.modalMode === ModalMode.EDIT) {
        await tagsModel.updateTag(modalModel.tagToEdit.id, { name: tagsModalView.tagName.value, parentId, color, textcolor });
    } else if (modalModel.modalMode === ModalMode.NEW) {
        for (const tagName of tagNames) {
            await tagsModel.createTag({ name: tagName, parentId, color, textcolor });
        }
    } else {
        console.error('Unknown modal mode:', modalModel.modalMode);
    }

    refreshTagsContainer();
    _closeModal();
}

function _searchParentTag(query) {
    const matchingTags = tagsModel.searchTags(query, 'startsWith');
    tagsModalView.parentNameSuggestions.innerHTML = '';
    if (matchingTags.length > 0) {
        tagsModalView.parentNameSuggestions.classList.remove('hidden');
        matchingTags.forEach(tag => {
            const li = document.createElement('li');
            const div = tagsView.buildTagHierarchyDiv(tagsModel.buildSingleTagHierarchy(tag));
            const divClone = div.cloneNode(true);
            li.appendChild(div);
            li.addEventListener('click', () => {
                if(tagsModel.isChildTag(tagsModel.tagToEdit, tag)) {
                    showPopup('', i18nModel.t('tag-alert-not-allowed-parent-tag'), 'warning');
                    return;
                }
                modalModel.selectedParentTag = tag;
                tagsModalView.parentTagName.value = '';
                tagsModalView.parentTagLabel.innerHTML = '';
                tagsModalView.parentTagLabel.appendChild(divClone);                   
                tagsModalView.parentNameSuggestions.classList.add('hidden');
            });
            tagsModalView.parentNameSuggestions.appendChild(li);
        });
        highlightText(query, 'parent-name-suggestions', 'li span:last-child');
    } else {
        tagsModalView.parentNameSuggestions.classList.add('hidden');
    }
}

export function initTagsModal() {

    tagsView.addTagButton.addEventListener('click', () => { openNewTagModal(); });

    tagsModalView.cancelButton.addEventListener('click', _closeModal);

    tagsModalView.okButton.addEventListener('click', _saveTag);

    tagsModalView.clearParentTagButton.addEventListener('click', () => {
        tagsModel.selectedParentTag = null;
        tagsModalView.parentTagLabel.innerHTML = '';
        tagsModalView.parentTagName.value = '';        
    });

    tagsModalView.parentTagName.addEventListener('input', () => {
        const query = tagsModalView.parentTagName.value.toLowerCase();
        if (query.length > 0) {
            _searchParentTag(query);
        } else {
            tagsModalView.parentNameSuggestions.classList.add('hidden');
        }
    });

    tagsModalView.parentTagName.addEventListener('blur', () => {
        setTimeout(() => {
            tagsModalView.parentNameSuggestions.classList.add('hidden');
        }, 200);
    });
}

export function openNewTagModal(parentTag = null) {
        modalModel.modalMode = ModalMode.NEW;
        modalModel.selectedParentTag = parentTag;

        tagsModalView.modalTitle.value = i18nModel.t('tag-add');
        tagsModalView.tagName.value = '';

        if(parentTag) {
            tagsModalView.parentTagLabel.appendChild(tagsView.buildTagHierarchyDiv(tagsModel.buildSingleTagHierarchy(parentTag)));
            tagsModalView.tagColor.value = parentTag.color;
            tagsModalView.tagTextColor.value = parentTag.textcolor;
        } else {
            tagsModalView.parentTagLabel.innerHTML = '';
            tagsModalView.tagColor.value = settingsModel.defTagBgColor;
            tagsModalView.tagTextColor.value = settingsModel.defTagTextColor;
        }

        tagsModalView.tagModal.classList.remove('hidden');
        tagsModalView.tagName.focus();
    }

export function openEditTagModal(tag) {
        modalModel.modalMode = ModalMode.EDIT;
        modalModel.tagToEdit = tag;
        const parentTag = tagsModel.tags.find(t => t.id === tag.parent_id);
        modalModel.selectedParentTag = parentTag;

        tagsModalView.modalTitle.value = i18nModel.t('tag-edit');
        tagsModalView.tagName.value = tag.name;
        tagsModalView.tagColor.value = tag.color;
        tagsModalView.tagTextColor.value = tag.textcolor;
        tagsModalView.parentTagLabel.appendChild(tagsView.buildTagHierarchyDiv(tagsModel.buildSingleTagHierarchy(parentTag)));

        tagsModalView.tagModal.classList.remove('hidden');
        tagsModalView.tagName.focus();
    }