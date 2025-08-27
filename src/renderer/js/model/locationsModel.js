let locations = [];
let activeLocation = null;
let root = null;
let currentDirectory = null;

export const locationsModel = { 
    get locations() { return locations;},
    set locations(newLocations) { locations = newLocations; },

    get activeLocation() { return activeLocation; },
    set activeLocation(newActive) { activeLocation = newActive; },
    
    get root() { return root; },
    set root(newRoot) { root = newRoot; },

    get currentDirectory() { return currentDirectory; },
    set currentDirectory(newCurrent) { currentDirectory = newCurrent; },

    async getLocationsFromDB() { 
        locations = await window.api.getLocations();
        if (!Array.isArray(locations)) {
            console.error('getLocationsFromDB: window.api.getLocations() did not return an array', locations);
            locations = [];
        }
        return locations;
    },

    async addLocation(location) {
        try {
            const newLoc = await window.api.addLocation(location);
            locations.push(newLoc);
        } catch (error) {
            console.error('Error during adding location', error);
            showPopup('', error, 'error');
        }
    },

    async updateLocation(id, locationData) {
        try {
            await window.api.updateLocation(id, locationData);
            const index = locations.findIndex(loc => loc.id === id);
            if (index !== -1) {
                locations[index] = { id, ...locationData };
            }
        } catch (error) {
            console.error('Error during updating location', error);
        }
    },

    async deleteLocation(id) {
        try {
            await window.api.deleteLocation(id);
            locations = locations.filter(loc => loc.id !== id);
        } catch (error) {
            console.error('Error during deleting location', error);
        }
    },

    async getDirectoryHierarchy(directoryPath) {
        try {
            return await window.api.getDirectoryHierarchy(directoryPath);
        } catch (error) {
            console.error('Error during fetching directory hierarchy ' + directoryPath, error);
            return null;
        }
    }
    
}