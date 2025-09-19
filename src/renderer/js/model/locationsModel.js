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
        const rawLocations = await window.api.getLocations();
        locations = rawLocations.map(record => new Location(record));
        if (!Array.isArray(locations)) {
            console.error('getLocationsFromDB: window.api.getLocations() did not return an array', locations);
            locations = [];
        }
        return locations;
    },

    async addLocation(locationData) {
        try {
            const newLoc = await window.api.addLocation(locationData);
            locations.push(new Location(newLoc));
        } catch (error) {
            console.error('Error during adding location', error);
            showPopup('', error, 'error');
        }
    },

    async updateLocation(locationData) {
        try {
            await window.api.updateLocation(locationData);
            const index = locations.findIndex(loc => loc.id === locationData.id);
            if (index !== -1) {
                locations[index] = new Location(locationData);
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

    findLocationById(id) {
        return locations.find(location => location.id === id);
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

class Location {
  constructor({ id, path, name}) {
    this.id = id;
    this.path = path;
    this.name = name;
  }
}