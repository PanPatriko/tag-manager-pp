let files = [];

export const filesModel = { 
    get files() { return files;},
    set files(newFiles) { files = newFiles; }  
}