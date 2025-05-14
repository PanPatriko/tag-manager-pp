import { tags } from './state.js';
import { addTag } from "./modals/fileTagModal.js";

document.addEventListener('click', (event) => {
    const tagElement = event.target.closest('.tag-item');
    if (tagElement) {
        const tagId = tagElement.dataset.id;
        const expandedTags = getExpandedTags();

        if (tagElement.classList.toggle('expanded')) {
            expandedTags.push(tagId);
        } else {
            const index = expandedTags.indexOf(tagId);
            if (index !== -1) expandedTags.splice(index, 1);
        }

        saveExpandedTags(expandedTags);
        applyExpandedTags()
    }

    const fileTagElement = event.target.closest('.file-tag-item');
    if (fileTagElement) {
        const tagId = fileTagElement.dataset.id;
        const expandedTags = getExpandedFileTags();

        if (fileTagElement.classList.toggle('expanded')) {
            expandedTags.push(tagId);
        } else {
            const index = expandedTags.indexOf(tagId);
            if (index !== -1) expandedTags.splice(index, 1);
        }

        saveExpandedFileTags(expandedTags);
        applyExpandedFileTags()
    }
});

export function saveExpandedTags(tagIds) {
    localStorage.setItem('expandedTags', JSON.stringify(tagIds));
}

export function saveExpandedFileTags(tagIds) {
    localStorage.setItem('expandedFileTags', JSON.stringify(tagIds));
}

export function getExpandedTags() {
    const tags = localStorage.getItem('expandedTags');
    return tags ? JSON.parse(tags) : [];
}

export function getExpandedFileTags() {
    const tags = localStorage.getItem('expandedFileTags');
    return tags ? JSON.parse(tags) : [];
}

export function applyExpandedTags() {
    const expandedTags = getExpandedTags();
    expandedTags.forEach(tagId => {
        const tagElements = document.querySelectorAll(`.tag-item[data-id="${tagId}"]`);
        tagElements.forEach(tagElement => {
            if (tagElement.nodeName == "SPAN") {
                tagElement.classList.add('expanded');            
                const siblingUl = tagElement.nextElementSibling;
                if (siblingUl && siblingUl.nodeName === "UL") {                
                    siblingUl.style.display = "block";
                    tagElement.parentElement.classList.add("expanded");
                }

            }
        });       
    });
}

export function applyExpandedFileTags() {
    const expandedTags = getExpandedFileTags();
    expandedTags.forEach(tagId => {
        const tagElements = document.querySelectorAll(`.file-tag-item[data-id="${tagId}"]`);
        tagElements.forEach(tagElement => {
            if (tagElement.nodeName == "SPAN") {
                tagElement.classList.add('expanded');            
                const siblingUl = tagElement.nextElementSibling;
                if (siblingUl && siblingUl.nodeName === "UL") {                
                    siblingUl.style.display = "block";
                    tagElement.parentElement.classList.add("expanded");
                }
            }
        });       
    });
}

export function buildTagHierarchy(tags) {
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

    function sortTagsByName(tagList) {
        tagList.sort((a, b) => a.name.localeCompare(b.name));
        tagList.forEach(tag => {
            if (tag.children.length > 0) {
                sortTagsByName(tag.children);
            }
        });
    }

    sortTagsByName(hierarchy);

    return hierarchy;
}

export function addMissingParentTags(fileTags) {
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
}

export function addMissingChildTags(fileTags, query) {
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

export function addMissingParentTagsForSingleTag(tag) {
    const completeTags = [tag];
    const tagIds = new Set([tag.id]);

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
    return completeTags;
}

export function getTagHierarchyString(tag) {
    const hierarchy = [];
    let currentTag = tag;

    while (currentTag) {
        hierarchy.unshift(currentTag.name);
        currentTag = tags.find(t => t.id === currentTag.parent_id);
    }

    return hierarchy.join(' > ');
}

export function getTagHierarchySpan(tag) {
    const hierarchy = [];
    let currentTag = tag;

    while (currentTag) {
        hierarchy.unshift(currentTag);
        currentTag = tags.find(t => t.id === currentTag.parent_id);
    }

    const div = document.createElement('div');
    hierarchy.forEach((tag, index) => {
        const tagSpan = document.createElement('span');
        tagSpan.style.backgroundColor = tag.color;
        tagSpan.style.color = tag.textcolor;
        tagSpan.textContent = tag.name;
        div.appendChild(tagSpan);

        if (index < hierarchy.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ' > ';
            div.appendChild(separator);
        }
    });

    return div;
}

export function getTagHierarchy(tag) {
    const completeTags = [tag];
    const tagIds = new Set([tag.id]);

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
    return completeTags;
}

function renderTagTree(containerId, tagHierarchy, tagClass, onClick) {
    const container = document.getElementById(containerId);

    function createTagList(tags) {
        const ul = document.createElement("ul");
        tags.forEach(tag => {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = tag.name;
            tagClass.split(' ').forEach(cls => span.classList.add(cls));
            span.dataset.id = tag.id;
            span.style.color = tag.textcolor;
            span.style.backgroundColor = tag.color;

            li.appendChild(span);

            if (onClick) {
                span.addEventListener("click", () => onClick(tag, li));
            }

            if (tag.children.length > 0) {
                const childrenUl = createTagList(tag.children);
                childrenUl.style.display = "none";
                li.classList.add("parent-li");
                li.appendChild(childrenUl);
            } else if (containerId === 'file-tags-container') {
                li.classList.add("child-li");
            }

            ul.appendChild(li);
        });
        return ul;
    }

    container.innerHTML = "";
    const tree = createTagList(tagHierarchy);
    container.appendChild(tree);
}

export function renderTagsContainerTree(tagHierarchy) {
    renderTagTree(
        'tags-container',
        tagHierarchy,
        'tag-label tag-item',
        (tag, li) => {
            const childUl = li.querySelector("ul");
            if (childUl) {
                if (childUl.style.display === "none") {
                    childUl.style.display = "block";
                    li.classList.add("expanded");
                } else {
                    childUl.style.display = "none";
                    li.classList.remove("expanded");
                }
            }
        }
    );
}

export function renderFileTagsTree(tagHierarchy) {
    //renderTagsAsDivs('file-tags-container', tagHierarchy);
    renderTagTree(
        'file-tags-container',
        tagHierarchy,
        'tag-label file-tag-item',
        (tag, li) => {
            const childUl = li.querySelector("ul");
            if (childUl) {
                if (childUl.style.display === "none") {
                    childUl.style.display = "block";
                    li.classList.add("expanded");
                } else {
                    childUl.style.display = "none";
                    li.classList.remove("expanded");
                }
            }
        }
    );
}

function renderTagsAsDivs(containerId, tags) {
    const tagsContainer = document.getElementById(containerId);

    function createTagList(tags) {
        tags.forEach((tag) => {
            const tagDiv = document.createElement('div');
            tagDiv.className = 'tag';
            tagDiv.textContent = tag.name;
            tagDiv.dataset.id = tag.id
            tagDiv.style.color = tag.textcolor;
            tagDiv.style.backgroundColor = tag.color;
            tagsContainer.appendChild(tagDiv);
            if (tag.children.length > 0) {
                createTagList(tag.children);
            }
        });
     }

     createTagList(tags);
}

export function renderModalFileTagsTree(tagHierarchy) {
    const container = document.getElementById('modal-file-tags-tree');

    function createTagList(tags) {
        const ul = document.createElement("ul");
        tags.forEach(tag => {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = tag.name;
            span.classList.add("modal-tag-label");
            span.dataset.id = tag.id;
            span.style.color = tag.textcolor;
            span.style.backgroundColor = tag.color;

            li.appendChild(span);

            span.addEventListener("click", () => {
                const tagsContainer = document.getElementById('modal-file-tags-container');
                const currentTags = Array.from(tagsContainer.querySelectorAll('.tag')).map(tagDiv => tagDiv.dataset.id);
                if (!currentTags.includes(tag.id.toString())) {
                    addTag(tag);
                }
                document.getElementById('file-tag-search').focus();
            });

            if (tag.children.length > 0) {
                const childrenUl = createTagList(tag.children);
                childrenUl.style.display = "block";
                li.appendChild(childrenUl);
            }

            ul.appendChild(li);
        });
        return ul;
    }

    container.innerHTML = "";
    const tree = createTagList(tagHierarchy);
    container.appendChild(tree);
}

export function isChildTag(parentTag, childTag) {
    if (!parentTag || !childTag) return false;
    if (parentTag.id === childTag.id) return true;
    if (!parentTag.children) return false;
    return parentTag.children.some(tag => isChildTag(tag, childTag));
}

export function searchTagsInclude(query) {
    const lowerCaseQuery = query.toLowerCase();
    return tags.filter(tag => tag.name.toLowerCase().includes(lowerCaseQuery));
}

export function searchTagsStartsWith(query) {
    const lowerCaseQuery = query.toLowerCase();
    return tags.filter(tag => tag.name.toLowerCase().startsWith(lowerCaseQuery));
}

export async function getTagIdByName(tagName, tags) {
    const tag = tags.find(t => t.name === tagName);
    return tag ? tag.id : null;
}