import { setLocations, setRootLoc, thumbnailDir } from "../state.js"

import { openLocationModal } from "../modals/locationModal.js";
import { displayDirectory } from "../content/content.js"

const addLocationButton = document.getElementById('add-location');
const container = document.getElementById('location-container');
const dirContainer = document.getElementById('directory-container');

addLocationButton.addEventListener('click', () => {
    openLocationModal();
});

export async function refreshLocations() {
    const locations = await window.api.getLocations();
    setLocations(locations);
    renderLocationsAsDivs(locations);
}

function renderLocationsAsDivs(locations) {
    container.innerHTML = "";

    function createLocationElement(location) {
        const locDiv = document.createElement("div");
        locDiv.classList.add("loc-item");
        locDiv.textContent = location.name;
        locDiv.dataset.id = location.id;
        locDiv.setAttribute('title', location.path);

        locDiv.addEventListener("click", async (e) => {
            if(await window.api.fileExists(location.path)) {
                fetchDirectoryHierarchy(location.path).then((hierarchy) => {
                    if (hierarchy) {
                        dirContainer.innerHTML = '';
                        renderHierarchy(hierarchy, dirContainer);
                    } else {
                        dirContainer.dataset.i18n = 'loc-directory-limit';
                        dirContainer.textContent = window.translations['loc-directory-limit'];
                    }
                });
                setRootLoc(location.path);
                displayDirectory(location.path);
                const activeLocation = document.querySelector(".loc-active");
                if (activeLocation) {
                    activeLocation.classList.remove("loc-active");
                }
                locDiv.classList.add("loc-active");
            } else {
                Swal.fire({
                    text: window.translations['dir-read-error'],
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'custom-swal-popup'
                    }
                });
            }
        });
        return locDiv;
    }

    locations.forEach((location) => {
        const locationElement = createLocationElement(location);
        container.appendChild(locationElement);     
    });
}

function renderHierarchy(hierarchy, parentElement) {
    if(hierarchy.name === thumbnailDir) {   
        return;
    }
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    const span = document.createElement('span');

    span.textContent = hierarchy.name
    span.addEventListener('click', (event) => {
        event.stopPropagation();
        displayDirectory(hierarchy.fullPath);
    });

    li.appendChild(span);
    ul.appendChild(li);
    parentElement.appendChild(ul);

    if (hierarchy.children && hierarchy.children.length > 0) {

        const button = document.createElement('button');
        button.textContent = '▼';
    
        const toggleChildren = () => {
            const childUls = li.querySelectorAll("ul");
            childUls.forEach(childUl => {
                if (childUl.style.display === 'none') {
                    childUl.style.display = 'block';
                    button.textContent = '▼';
                } else {
                    childUl.style.display = 'none';
                    button.textContent = '►';
                }
            });      
        };
    
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleChildren();
        });

        li.appendChild(button);
        
        hierarchy.children.forEach(child => {
            renderHierarchy(child, li);
        });
    }
}

async function fetchDirectoryHierarchy(directoryPath) {
    try {
        return await window.api.getDirectoryHierarchy(directoryPath);
    } catch (error) {
        //console.error('Error during fetching directory hierarchy ' + directoryPath, error);
        return null;
    }
}