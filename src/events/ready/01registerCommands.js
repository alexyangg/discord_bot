//const { testServer } = require('../../../config.json');
const path = require('path');
const areCommandsDifferent = require(path.resolve(__dirname, '../../utils/areCommandsDifferent'));
const getApplicationCommands = require(path.resolve(__dirname, '../../utils/getApplicationCommands'));
const getLocalCommands = require(path.resolve(__dirname, '../../utils/getLocalCommands'));

module.exports = async (client) => {

    try {
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(client);

        for (const localCommand of localCommands) {
            const { name, description, options } = localCommand;
            
            // check if command exists in the bot
            const existingCommand = await applicationCommands.cache.find(
                (cmd) => cmd.name === name
            );

            if (existingCommand) {
                if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`Deleted command "${name}".`);
                    continue;
                }

                // edit command to match with latest localCommand version
                if (areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                    });

                    console.log(`Edited command "${name}".`);
                }
            } else {
                if (localCommand.deleted) {
                    console.log(`Skipped registering command "${name}" as it's set to delete.`);
                    continue;
                }

                // this code only runs when the command does 
                // not exist and is not set to be deleted
                await applicationCommands.create({
                    name,
                    description,
                    options,
                });

                console.log(`Registered command "${name}".`);
                
            }
        }
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
};