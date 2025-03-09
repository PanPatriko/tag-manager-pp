import {tags, setTags} from "../state.js"
import { buildTagHierarchy, renderTagsContainerTree, applyExpandedTags, saveExpandedTags, getExpandedTags} from "../tags.js";
import {openModalNewTag} from "../modals/tagModal.js"

const addTagButton = document.getElementById('add-tag');

addTagButton.addEventListener('click', () => {
    openModalNewTag();
});

// Old style
function renderTagsAsDivs(containerId, tags) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    function createTagElement(tag) {
        const parentDiv = document.createElement("div");
        parentDiv.classList.add("tag-parent", "tag-item");
        parentDiv.textContent = tag.name;
        parentDiv.dataset.id = tag.id;
        parentDiv.style.backgroundColor = tag.color;
        parentDiv.style.color = tag.textcolor;
        
        const childrenContainer = document.createElement("div");
        childrenContainer.classList.add("tag-children", "tag-item");
        if (tag.children && tag.children.length > 0) {
            tag.children.forEach((childTag) => {
                const childDiv = createTagElement(childTag);
                childrenContainer.appendChild(childDiv);
            });
            parentDiv.addEventListener("click", (e) => {
                e.stopPropagation();
                childrenContainer.classList.toggle("visible");
                const tagId = parentDiv.dataset.id;
                const expandedTags = getExpandedTags();
                if (parentDiv.classList.toggle('expanded')) {
                    expandedTags.push(tagId);
                } else {
                    const index = expandedTags.indexOf(tagId);
                    if (index !== -1) expandedTags.splice(index, 1);
                }        
                saveExpandedTags(expandedTags);
            });
        }

        parentDiv.appendChild(childrenContainer);
        return parentDiv;
    }

    tags.forEach((tag) => {
        const tagElement = createTagElement(tag);
        if (tag.parent_id == null) {
            container.appendChild(tagElement);
        }
    });
}

export async function refreshTags() {
    const newTags = await window.api.getTags();
    setTags(newTags);
    const tagHierarchy = buildTagHierarchy(tags);
    //renderTagsAsDivs("tags-container", tagHierarchy); // Old style
    renderTagsContainerTree(tagHierarchy);
    applyExpandedTags()
}