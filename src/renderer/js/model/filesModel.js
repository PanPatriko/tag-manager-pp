let files = [];
let sortOrder = 'asc';  // Default sort order

export const filesModel = { 
    get files() { return files;},
    set files(newFiles) { files = newFiles; },

    get sortOrder() { return sortOrder; },
    
    getSelectedFiles() {
        return files.filter(file => file.selected);
    },

    changeSortOrder() {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    },

    sortFiles() {
        if (files.length < 2) return;

        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        files = files.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) {
                return -1;
            }
            if (!a.isDirectory && b.isDirectory) {
                return 1;
            }
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return sortOrder === 'asc' ? collator.compare(nameA, nameB) : collator.compare(nameB, nameA);
        });
    }
}