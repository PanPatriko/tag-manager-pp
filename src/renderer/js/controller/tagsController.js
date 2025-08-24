import { tagsModel, TagType, TagClass } from '../model/tagsModel.js';

import { tagsView } from '../view/tagsView.js';

function _handleExpandTags(tag, tagType, tagItem) {
    const tagId = tag.dataset.id;
    const expandedTags = tagsModel.getExpandedTags(tagType);

    if (tag.classList.toggle('expanded')) {
        expandedTags.push(tagId);
    } else {
        const index = expandedTags.indexOf(tagId);
        if (index !== -1) expandedTags.splice(index, 1);
    }

    tagsModel.setExpandedTags(tagType, expandedTags);
    tagsView.applyExpandedTags(expandedTags, tagItem)
}

export function refreshTagsContainer() {
    const tagHierarchy = tagsModel.buildTagHierarchy(tagsModel.tags);

    tagsView.renderTagTree({
        container: tagsView.tagsContainer,
        tagHierarchy,
        tagClass: 'tag-label tag-item',
        childrenInitiallyVisible: false
    });  

    tagsView.applyExpandedTags(
        tagsModel.getExpandedTags(TagType.EXPANDED_TAGS), 
        TagClass.TAG_ITEM
    );
}

export async function initTagsController() {
    await tagsModel.getTagsFromDB();

    refreshTagsContainer();

    tagsView.tagsContainer.addEventListener('click', (event) => { 
        const tag = event.target.closest(`.${TagClass.TAG_ITEM}`);
        if (tag) {
            _handleExpandTags(tag, TagType.EXPANDED_TAGS, TagClass.TAG_ITEM);
        }
    });

    tagsView.fileTagsContainer.addEventListener('click', (event) => { 
        const fileTag = event.target.closest(`.${TagClass.FILE_TAG_ITEM}`);
        if (fileTag) {
            _handleExpandTags(fileTag, TagType.EXPANDED_FILE_TAGS, TagClass.FILE_TAG_ITEM);
        }
    });
}