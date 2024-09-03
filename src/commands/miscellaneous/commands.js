const { Client, Interaction, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const createButtonRow = require('../../utils/createButtonRow');

module.exports = {
    name: 'commands',
    description: 'Displays a list of all of my available bot commands.',
    /**
     * 
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {
        const commandsPerPage = 10;
        const commandFolders = fs.readdirSync(path.resolve(__dirname, '../../commands'));

        const commandsByCategory = {};
        const pages = [];

        let currentPage = 0;
        let totalPages = 0;
        let pageCounter = 0;

        // loop through each command category folder and load commands
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(path.resolve(__dirname, `../../commands/${folder}`))
                .filter(file => file.endsWith('.js'));
            commandsByCategory[folder] = commandFiles.map(file => {
                const command = require(path.resolve(__dirname, `../../commands/${folder}/${file}`));
                return {
                    name: command.name,
                    description: command.description || 'No description provided.',
                };
            });

            totalPages += Math.ceil(commandsByCategory[folder].length / commandsPerPage);
        }

        // push commands into pages by category
        for (const [category, commands] of Object.entries(commandsByCategory)) {
            for (let i = 0; i < commands.length; i += commandsPerPage) {
                pageCounter++;
                const commandsArray = Object.entries(commands);

                // access array of command objects by slicing
                const commandsPage = commands.slice(i, i + commandsPerPage)
                    .map(cmd => `\`${cmd.name}\`: ${cmd.description}`) // access command fields and format commands
                    .join('\n');


                const embed = new EmbedBuilder()
                    .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
                    .setDescription(commandsPage)
                    .setFooter({
                        text: `Page ${pageCounter} of ${totalPages}`
                    })
                    .setColor('#ffffff');

                pages.push(embed);
            }
        }

        const message = await interaction.reply({
            embeds: [pages[currentPage]],
            components: [createButtonRow(currentPage, pages)],
            fetchReply: true,
        });

        const collector = message.createMessageComponentCollector();

        collector.on('collect', i => {
            if (i.user.id === interaction.user.id) {

                switch (i.customId) {
                    case 'first':
                        currentPage = 0;
                        break;
                    case 'previous':
                        currentPage = Math.max(currentPage - 1, 0);
                        break;
                    case 'next':
                        currentPage = Math.min(currentPage + 1, pages.length - 1);
                        break;
                    case 'last':
                        currentPage = pages.length - 1;
                        break;
                }

                i.update({
                    embeds: [pages[currentPage]],
                    components: [createButtonRow(currentPage, pages)],
                });

            } else {
                const ephemeralEmbed = new EmbedBuilder()
                    .setDescription(`This commands menu is controlled by <@${interaction.user.id}>. To use the buttons, you will have to run the command yourself.`)
                    .setColor('#ffffff');
                i.reply({
                    embeds: [ephemeralEmbed],
                    ephemeral: true
                });
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] });
        });

    }
};