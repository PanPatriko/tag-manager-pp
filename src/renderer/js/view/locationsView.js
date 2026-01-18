import { thumbnailDir } from "../utils.js"

const path = window.api.path;

export const locationsView = {

    locationPanel: null,
    locationContainer: null,
    directoryContainer: null,

    init() {
        this.locationPanel = document.getElementById('location-panel');
        this.locationContainer = document.getElementById('location-container');
        this.directoryContainer = document.getElementById('directory-container');
    },

    getLocationPanelHeight() {
        return this.locationPanel.offsetHeight;
    },

    getLocationContainerHeight() {
        return this.locationContainer.offsetHeight;
    },

    setLocationContainerHeight(height) {
        height = Math.max(40, height);
        height = Math.min(this.getLocationPanelHeight() - 40, height);
        this.locationContainer.style.height = height + 'px';
    },

    isLocationItem(target) {
        return target.closest('.loc-item');
    },

    isExpandButton(target) {
        return target.closest('.loc-item-expand-btn');
    },

    isDirectorySpan(target) {
        return target.closest('.loc-item-span');
    },

    renderLocations(locations) {
        this.locationContainer.innerHTML = "";
        locations.forEach(location => {
            const locDiv = document.createElement("div");
            locDiv.classList.add("loc-item");
            locDiv.textContent = location.name;
            locDiv.dataset.id = location.id;
            locDiv.setAttribute('title', location.path);
            this.locationContainer.appendChild(locDiv);
        });
    },

    setActiveLocation(locationId) {
        const previousActiveLocation = document.querySelector(".loc-active");
        if (previousActiveLocation) previousActiveLocation.classList.remove("loc-active");
        const activeLocation = document.querySelector(`.loc-item[data-id="${locationId}"]`);
        activeLocation.classList.add("loc-active");
    },

    expandRootDirectory() {
        const button = this.directoryContainer.querySelector('button');
        if (button) {
            button.click();
        }
    },

    async expandButtonClick(expandBtn, directoryHierarchy) {

        function hideExpandButton() {
            expandBtn.style.display = 'none';
            expandBtn._childrenLoaded = true;
            expandBtn.disabled = false;
        }

        if (expandBtn.disabled && !expandBtn._childrenLoaded) return;

        if (!expandBtn._childrenLoaded) {
            expandBtn.disabled = true;
            if (directoryHierarchy.children && directoryHierarchy.children.length > 0) {
                if (directoryHierarchy.children.length === 1 && directoryHierarchy.children[0].name === thumbnailDir) {
                    // No children: hide the expand button
                    hideExpandButton();
                    return;
                }
                const loadedUl = document.createElement('ul');
                loadedUl.style.display = 'block'; // show by default after load
                for (const grandChild of directoryHierarchy.children) {
                    this.renderHierarchy(grandChild.fullPath, loadedUl);
                }
                expandBtn.textContent = '▼';
                expandBtn._childrenContainer = loadedUl;
                expandBtn._childrenLoaded = true;
                expandBtn.disabled = false;
                expandBtn.parentElement.appendChild(loadedUl)
            } else {
                // No children: hide the expand button
                hideExpandButton();
            }

        } else {
            // Toggle display of loaded children
            const loadedUl = expandBtn._childrenContainer;
            if (loadedUl) {
                if (loadedUl.style.display === 'none') {
                    loadedUl.style.display = 'block';
                    expandBtn.textContent = '▼';
                } else {
                    loadedUl.style.display = 'none';
                    expandBtn.textContent = '►';
                }
            }
        }
    },

    async renderHierarchy(locationPath, parentElement = null) {
        if (!parentElement) parentElement = this.directoryContainer;
        parentElement.innerHTML = "";
        const pathName = await path.basename(locationPath);
        
        if (pathName === thumbnailDir) return;

        const ul = document.createElement('ul');
        const li = document.createElement('li');

        const span = document.createElement('span');
        span.classList.add("loc-item-span");
        span.textContent = pathName;
        span.path = locationPath;

        const expandBtn = document.createElement('button');
        expandBtn.classList.add("loc-item-expand-btn");
        expandBtn.path = locationPath;
        expandBtn.textContent = '►';

        li.appendChild(span);
        li.appendChild(expandBtn);
        ul.appendChild(li);
        parentElement.appendChild(ul);
    },

    onAddLocationClick(handler) {
        const el = document.getElementById('add-location');
        el.addEventListener('click', () => handler());
    },

    onLocationContainerClick(handler) {
        this.locationContainer.addEventListener('click', (e) => handler(e));
    },

    onDirectoryContainerClick(handler) {
        this.directoryContainer.addEventListener('click', (e) => handler(e));
    },

    onResizeHandleMouseDown(handler) {
        const el = document.getElementById('location-resize-handle');
        el.addEventListener('mousedown', (e) => handler(e));
    }
}