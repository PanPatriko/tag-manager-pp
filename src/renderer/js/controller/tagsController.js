import { tagsModel, TagType, TagClass } from '../model/tagsModel.js';

import { tagsView } from '../view/tagsView.js';

function onTagItemClick(tag, tagType, tagItem) {
    const tagId = tagsView.getTagItemId(tag);
    const expandedTags = tagsModel.getExpandedTags(tagType);

    if (tagsView.expandTagItem(tag)) {
        expandedTags.push(tagId);
    } else {
        const index = expandedTags.indexOf(tagId);
        if (index !== -1) expandedTags.splice(index, 1);
    }

    tagsModel.setExpandedTags(tagType, expandedTags);
    tagsView.applyExpandedTags(expandedTags, tagItem)
}

export function refreshTagsContainer() {
    const tagHierarchy = tagsModel.buildTagHierarchy();

    tagsView.renderTagTree({
        container: tagsView.getTagsContainer(),
        tagHierarchy,
        tagClass: 'tag-label tag-item',
        childrenInitiallyVisible: false
    });  

    tagsView.applyExpandedTags(
        tagsModel.getExpandedTags(TagType.EXPANDED_TAGS), 
        TagClass.TAG_ITEM
    );
}

export async function initTags() {
    await tagsModel.getTagsFromDB();

    refreshTagsContainer();

    tagsView.onTagsContainerClick((event) => { 
        const tag = event.target.closest(`.${TagClass.TAG_ITEM}`);
        if (tag) {
            onTagItemClick(tag, TagType.EXPANDED_TAGS, TagClass.TAG_ITEM);
        }
    });

    tagsView.onFileTagsContainerClick((event) => { 
        const fileTag = event.target.closest(`.${TagClass.FILE_TAG_ITEM}`);
        if (fileTag) {
            onTagItemClick(fileTag, TagType.EXPANDED_FILE_TAGS, TagClass.FILE_TAG_ITEM);
        }
    });
}