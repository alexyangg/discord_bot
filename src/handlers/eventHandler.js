const path = require('path');
const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) => {
    const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

    for (const eventFolder of eventFolders) {
        const eventFiles = getAllFiles(eventFolder);
        eventFiles.sort((a, b) => a > b);
        //console.log(eventFiles);

        // regex to replace back slashes with forward slashes, 
        // for consistency between operating systems
        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
        
        // event listener to extract function sout of files
        client.on(eventName, async (arg) => {
            for (const eventFile of eventFiles) {
                const eventFunction = require(eventFile);

                // run function in eventFile
                await eventFunction(client, arg);
            }
        })
    }
};