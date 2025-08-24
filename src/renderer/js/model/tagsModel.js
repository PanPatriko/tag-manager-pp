let tags = [];

export const tagsModel = { 

    get tags() { return tags;},
    set tags(newTags) { tags = newTags; },

    async getTagsFromDB() { 
        tags = await window.api.getTags();
        if (!Array.isArray(tags)) {
            console.error('getTagsFromDB: window.api.getTags() did not return an array', tags);
            tags = [];
        }
        return tags;
    },

    async createTag(tagData) {
        const newTag = await window.api.createTag(tagData);
        tags.push(newTag);
    },

    async updateTag(id, tagData) {
        await window.api.updateTag(id, tagData);
        const index = tags.findIndex(tag => tag.id === id);
        if (index !== -1) {
            tags[index] = { ...tags[index], ...tagData };
        }
    },     

    async deleteTag(tagId) {
        await window.api.deleteTag(tagId);
        tags = tags.filter(tag => tag.id !== tagId);
    },

    getExpandedTags(tagType) {
        const expandedTags = localStorage.getItem(tagType);
        return expandedTags ? JSON.parse(expandedTags) : [];
    },

    setExpandedTags(tagType, tagIds) {
        localStorage.setItem(tagType, JSON.stringify(tagIds));
    },

    isChildTag(parentTag, childTag) {
        if (!parentTag || !childTag) return false;
        if (parentTag.id === childTag.id) return true;
        if (!parentTag.children) return false;
        return parentTag.children.some(tag => this.isChildTag(tag, childTag));
    },

    searchTags(query, mode) {
        const lowerCaseQuery = query.toLowerCase();
        if (mode === 'inlude') {
            return tags.filter(tag => tag.name.toLowerCase().includes(lowerCaseQuery));
        } else if (mode === 'startsWith') {
            return tags.filter(tag => tag.name.toLowerCase().startsWith(lowerCaseQuery));
        } else if (mode === 'exact') {
            return tags.filter(tag => tag.name.toLowerCase() === lowerCaseQuery);
        }
    },
    
    buildTagHierarchy(tags) {
        const tagMap = new Map();
        tags.forEach(tag => {
            tag.children = [];
            tagMap.set(tag.id, tag);
        });

        const hierarchy = [];
        tags.forEach(tag => {
            if (tag.parent_id) {
                const parent = tagMap.get(tag.parent_id);
                if (parent) {
                    parent.children.push(tag);
                }
            } else {
                hierarchy.push(tag);
            }
        });

        function sortTagsByName(tags) {
            tags.sort((a, b) => a.name.localeCompare(b.name));
            tags.forEach(tag => {
                if (tag.children.length > 0) {
                    sortTagsByName(tag.children);
                }
            });
        }

        sortTagsByName(hierarchy);

        return hierarchy;
    },

    buildSingleTagHierarchy(tag) {
        const hierarchy = [];
        let currentTag = tag;
    
        while (currentTag) {
            hierarchy.unshift(currentTag);
            currentTag = tags.find(t => t.id === currentTag.parent_id);
        }
    
        return hierarchy;
    },

    addMissingParentTags(fileTags) {
        const completeTags = [...fileTags];
        const tagIds = new Set(fileTags.map(tag => tag.id));

        for (const tag of fileTags) {
            let parentId = tag.parent_id;
            while (parentId && !tagIds.has(parentId)) {
                const parentTag = tags.find(t => t.id === parentId);
                if (parentTag) {
                    completeTags.push(parentTag);
                    tagIds.add(parentTag.id);
                    parentId = parentTag.parent_id;
                } else {
                    break;
                }
            }
        }
        return completeTags;
    },

    addMissingChildTags(fileTags, query) {
        const completeTags = [...fileTags];
        const tagIds = new Set(fileTags.map(tag => tag.id));

        function addChildren(tag) {
            const childTags = tags.filter(t => t.parent_id === tag.id);
            for (const childTag of childTags) {
                if (!tagIds.has(childTag.id)) {
                    completeTags.push(childTag);
                    tagIds.add(childTag.id);
                    addChildren(childTag);
                }
            }
        }

        for (const tag of fileTags) {
            if (tag.name.toLowerCase().includes(query.toLowerCase())) {
                addChildren(tag);
            }
        }

        return completeTags;
    }
}

export const TagType = Object.freeze({
    EXPANDED_FILE_TAGS: 'expandedFileTags',
    EXPANDED_TAGS: 'expandedTags'
});

export const TagClass = Object.freeze({
    FILE_TAG_ITEM: 'file-tag-item',
    TAG_ITEM: 'tag-item'
});