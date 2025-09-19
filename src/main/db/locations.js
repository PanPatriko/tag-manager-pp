const db = require('../database.js');

async function getLocations() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM locations', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getLocationById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM locations WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function createLocation(locationData) {
    const { name, path} = locationData;
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO locations (name, path) VALUES (?, ?)',
            [name, path],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    getLocationById(this.lastID).then(resolve).catch(reject);
                }
            }
        );
    });
}

async function updateLocation(locationData) {
    const {id, name, path} = locationData;
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE locations SET name = ?, path = ? WHERE id = ?',
            [name, path, id],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}

async function deleteLocation(locationId) {
    try {
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM locations WHERE id = ?', [locationId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        throw new Error("Error deleting location: " + error.message);
    }
}

module.exports = {getLocations, createLocation, updateLocation, deleteLocation}