const db = require('../database.js');
const { getAllChildTags } = require('./tags.js')

async function getFileTags(fileId) {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, parent_id, name, color, textcolor FROM tags join file_tags where id = file_tags.tag_id and file_tags.file_id = ?", [fileId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
}

async function addFileTag(fileId, tagId) {
    try {
        const exists = await new Promise((resolve, reject) => {
            db.get(
                'SELECT 1 FROM file_tags WHERE file_id = ? AND tag_id = ?',
                [fileId, tagId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? true : false);
                }
            );
        });

        if (exists) {
            //throw new Error("Tag already exists for this file");
            console.log(`Tag id=${tagId} already exists for this file id=${fileId}`);
            return;
        }

        await new Promise((resolve, reject) => {
            db.run('INSERT INTO file_tags (file_id, tag_id) VALUES (?, ?)', [fileId, tagId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    } catch (error) {
        throw new Error("Error during adding tag to file: " + error.message);
    }
}

async function deleteFileTag(fileId, tagId) {
    try {
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM file_tags WHERE file_id = ? AND tag_id = ?', [fileId, tagId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const childTagIds = await getAllChildTags(tagId);

        for (const childTagId of childTagIds) {
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM file_tags WHERE file_id = ? AND tag_id = ?', [fileId, childTagId], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    } catch (error) {
        throw new Error("Error deleting tag from file: " + error.message);
    }
}

module.exports = {getFileTags, addFileTag, deleteFileTag}