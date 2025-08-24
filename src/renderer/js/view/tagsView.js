export const tagsView = {

    get addTagButton() { return document.getElementById('add-tag'); },

    get tagsContainer() { return document.getElementById('tags-container'); },

    get fileTagsContainer() { return document.getElementById('file-tags-container'); },

    applyExpandedTags(expandedTags, selectorClass) {     
        expandedTags.forEach(tagId => {
            const tagElements = document.querySelectorAll(`.${selectorClass}[data-id="${tagId}"]`);
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
    },

    buildTagHierarchyString(hierarchy) { 
        const hierarchyTagNames = hierarchy.map(t => t.name);
        return hierarchyTagNames.join(' > ');
    },

    buildTagHierarchyDiv(hierarchy) { 
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
    },

    renderTagTree({
        container,
        tagHierarchy,
        tagClass = '',
        childrenInitiallyVisible = false,
        onTagClick = null
    }) {

        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        if (!container) return;


        function createTagList(tags) {
            const ul = document.createElement("ul");
            tags.forEach(tag => {
                const li = document.createElement("li");
                const span = document.createElement("span");
                
                span.dataset.id = tag.id;
                span.textContent = tag.name;
                if (tagClass) tagClass.split(' ').forEach(cls => span.classList.add(cls));           
                span.style.color = tag.textcolor;
                span.style.backgroundColor = tag.color;

                li.appendChild(span);

                span.addEventListener("click", () => {
                    if (onTagClick) {
                        onTagClick(tag, span, li);
                    } else if (li.querySelector("ul")) {
                        // Default expand/collapse behavior
                        const childUl = li.querySelector("ul");
                        if (childUl) {
                            const isVisible = childUl.style.display !== "none";
                            childUl.style.display = isVisible ? "none" : "block";
                            li.classList.toggle("expanded", !isVisible);
                        }
                    }
                });

                if (tag.children && tag.children.length > 0) {
                    const childrenUl = createTagList(tag.children);
                    childrenUl.style.display = childrenInitiallyVisible ? "block" : "none";
                    if (!childrenInitiallyVisible) li.classList.add("parent-li");
                    li.appendChild(childrenUl);
                }

                ul.appendChild(li);
            });
            return ul;
        }

        container.innerHTML = "";
        const tree = createTagList(tagHierarchy);
        container.appendChild(tree);
    },

}