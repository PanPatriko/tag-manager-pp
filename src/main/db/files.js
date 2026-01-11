const db = require('../database.js');
const { getAllChildTags } = require('./tags.js')

async function getFiles() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM files ORDER BY LOWER(name) ASC', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getFileById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM files WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function getFileByPath(path) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM files WHERE path = ?', [path], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function createFile(fileData) {
    const { name, path} = fileData;
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO files (name, path) VALUES (?, ?)',
            [name, path],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    getFileById(this.lastID).then(resolve).catch(reject);
                }
            }
        );
    });
}

async function updateFile(fileData) {
    const { name, path, id} = fileData;
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE files SET name = ?, path = ? WHERE id = ?',
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

async function deleteFile(fileId) {
    return new Promise(async (resolve, reject) => {
        try {
            await db.run('BEGIN TRANSACTION');
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM file_tags WHERE file_id = ?', [fileId], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            await new Promise((resolve, reject) => {
                db.run('DELETE FROM files WHERE id = ?', [fileId], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            await db.run('COMMIT');
            resolve();
        } catch (error) {
            await db.run('ROLLBACK');
            reject(new Error("Error deleting file: " + error.message));
        }
    });
}


async function searchFiles(andTags, orTags, notTags) {
    try {
        let query = 'SELECT DISTINCT f.* FROM files f';
        let conditions = [];
        let params = [];

        // Handle AND tags
        if (andTags && andTags.length > 0) {
            for (const tagId of andTags) {
                const childTags = await getAllChildTags(tagId);
                const allTags = [tagId, ...childTags];
                const placeholders = allTags.map(() => '?').join(',');
                query += ` JOIN file_tags ft${tagId} ON f.id = ft${tagId}.file_id AND ft${tagId}.tag_id IN (${placeholders})`;
                //conditions.push(`f.id IN (SELECT file_id FROM file_tags WHERE tag_id IN (${placeholders}))`);
                params.push(...allTags);
            }
        }

        // Handle OR tags
        if (orTags && orTags.length > 0) {
            let orConditions = [];
            for (const tagId of orTags) {
                const childTags = await getAllChildTags(tagId);
                const allTags = [tagId, ...childTags];
                const placeholders = allTags.map(() => '?').join(',');
                orConditions.push(`f.id IN (SELECT file_id FROM file_tags WHERE tag_id IN (${placeholders}))`);
                params.push(...allTags);
            }
            conditions.push(`(${orConditions.join(' OR ')})`);
        }

        // Handle NOT tags
        if (notTags && notTags.length > 0) {
            let notConditions = [];
            for (const tagId of notTags) {
                const childTags = await getAllChildTags(tagId);
                const allTags = [tagId, ...childTags];
                const placeholders = allTags.map(() => '?').join(',');
                notConditions.push(`f.id NOT IN (SELECT file_id FROM file_tags WHERE tag_id IN (${placeholders}))`);
                params.push(...allTags);
            }
            conditions.push(`(${notConditions.join(' AND ')})`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Sort by name asc
        query += ' ORDER BY LOWER(f.name) ASC';
        console.log(query);
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {getFiles, getFileById, getFileByPath, searchFiles, createFile, updateFile, deleteFile}