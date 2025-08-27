import { thumbnailDir } from "../state.js"

const path = window.api.path;

export const locationsView = {    
    get addLocationButton() { return document.getElementById('add-location'); },

    get locationContainer() { return document.getElementById('location-container'); },

    get directoryContainer() { return document.getElementById('directory-container'); },

    renderLocations(locations, onLocationClick) {
        const container = this.locationContainer;
        container.innerHTML = "";
        locations.forEach(location => {
            const locDiv = document.createElement("div");
            locDiv.classList.add("loc-item");
            locDiv.textContent = location.name;
            locDiv.dataset.id = location.id;
            locDiv.setAttribute('title', location.path);

            locDiv.addEventListener("click", e => onLocationClick(location, locDiv, e));

            container.appendChild(locDiv);
        });
    },

    setActiveLocation(locationId) {
        const previousActiveLocation = document.querySelector(".loc-active");
        if (previousActiveLocation) previousActiveLocation.classList.remove("loc-active");
        const activeLocation = document.querySelector(`.loc-item[data-id="${locationId}"]`);
        activeLocation.classList.add("loc-active");
    },

    async renderHierarchy(locationPath, parentElement, onDirectoryClick, loadChildrenCallback) {
        const pathName = await path.basename(locationPath);
        
        if (pathName === thumbnailDir) return;

        const ul = document.createElement('ul');
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = pathName;

        span.addEventListener('click', (event) => {
            event.stopPropagation();
            if (onDirectoryClick) onDirectoryClick(locationPath, span, li, event);
        });

        li.appendChild(span);

        const expandBtn = document.createElement('button');
        expandBtn.textContent = '►';
        expandBtn.addEventListener('click', async (event) => {
            event.stopPropagation();          
            if (expandBtn.disabled && !expandBtn._childrenLoaded) return;
            if (!expandBtn._childrenLoaded) {
                expandBtn.disabled = true;
                if (typeof loadChildrenCallback === 'function') {
                    const loadedHierarchy = await loadChildrenCallback(locationPath);
                    if (loadedHierarchy.children.length === 1 && loadedHierarchy.children[0].name === '.t') {
                        // No children: hide the expand button
                        expandBtn.style.display = 'none';
                        expandBtn._childrenLoaded = true;
                        expandBtn.disabled = false;
                        return;
                    }
                    if (loadedHierarchy && loadedHierarchy.children && loadedHierarchy.children.length > 0) {
                        const loadedUl = document.createElement('ul');
                        loadedUl.style.display = 'block'; // show by default after load
                        for (const grandChild of loadedHierarchy.children) {
                            this.renderHierarchy(grandChild.fullPath, loadedUl, onDirectoryClick, loadChildrenCallback);
                        }
                        li.appendChild(loadedUl);
                        expandBtn.textContent = '▼';
                        expandBtn._childrenContainer = loadedUl;
                        expandBtn._childrenLoaded = true;
                        expandBtn.disabled = false;
                    } else {
                        // No children: hide the expand button
                        expandBtn.style.display = 'none';
                        expandBtn._childrenLoaded = true;
                        expandBtn.disabled = false;
                    }
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
        });
        li.appendChild(expandBtn);

        ul.appendChild(li);
        parentElement.appendChild(ul);
    },
}