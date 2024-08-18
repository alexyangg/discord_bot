const fs = require('fs');
const path = require('path');

module.exports = (directory, foldersOnly = false) => {
    let fileNames = [];

    // import files inside any specific directory
    const files = fs.readdirSync(directory, { withFileTypes: true });

    // pushes the file paths into the fileNames array
    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (foldersOnly) {
            if (file.isDirectory()) {
                fileNames.push(filePath);
            }
        } else {
            if (file.isFile()) {
                fileNames.push(filePath);
            }
        }
    }

    return fileNames;
};