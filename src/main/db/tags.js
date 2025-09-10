const db = require('../database.js');

async function getTags() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM tags', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function getTagById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tags WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function createTag(tagData) {
    const { name, parent_id, color, textcolor } = tagData;
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO tags (name, parent_id, color, textcolor) VALUES (?, ?, ?, ?)',
            [name, parent_id, color, textcolor],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    getTagById(this.lastID).then(resolve).catch(reject);
                }
            }
        );
    });
}

async function updateTag(id, tagData) {
    const { name, parent_id, color, textcolor } = tagData;
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE tags SET name = ?, parent_id = ?, color = ?, textcolor = ? WHERE id = ?',
            [name, parent_id, color, textcolor, id],
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

async function deleteTag(id) {
    return new Promise(async (resolve, reject) => {
        try {
            db.run('BEGIN TRANSACTION');
            db.run('UPDATE tags SET parent_id = NULL WHERE parent_id = ?', id);
            db.run('DELETE FROM tags WHERE id = ?', id);
            db.run('COMMIT');
            resolve();
        } catch (error) {
            db.run('ROLLBACK');
            reject(error);
        }
    });
}

async function getChildTags(tagId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT id FROM tags WHERE parent_id = ?', [tagId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => row.id));
            }
        });
    });
}

async function getAllChildTags(tagId) {
    const childTags = await getChildTags(tagId);
    let allChildTags = [...childTags];

    for (const childTagId of childTags) {
        const grandChildTags = await getAllChildTags(childTagId);
        allChildTags = [...allChildTags, ...grandChildTags];
    }

    return allChildTags;
}

module.exports = {getTags, getTagById, createTag, updateTag, deleteTag, getChildTags, getAllChildTags}