const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const User = require('../../models/User');
const createButtonRow = require('../../utils/createButtonRow');

module.exports = {
    name: 'inventory',
    description: 'View the items in your inventory.',
    options: [
        {
            name: 'target-user',
            description: 'The user whose inventory you want to view.',
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const targetUser = interaction.options.getUser('target-user') || interaction.user;
        const userId = targetUser.id;
        let chooseDescription;

        if (targetUser === interaction.user) {
            chooseDescription = 'Here are the items in your inventory:';
        } else {
            chooseDescription = 'Here are the items in their inventory:';
        }

        try {
            let user = await User.findOne({ userId });

            if (!user) {
                user = new User({ userId });
                await user.save();
            }

            const inventory = user.inventory;
            const itemsPerPage = 5;
            const maxPages = Math.ceil(inventory.length / itemsPerPage);
            let currentPage = 0;

            const generateEmbed = (page) => {
                const embed = new EmbedBuilder()
                    .setTitle(`${targetUser.username}'s Inventory`)
                    .setColor('#ffffff')
                    .setFooter({ text: `Page ${page + 1} of ${maxPages}` });

                if (inventory.length === 0) {
                    embed.setDescription('This user has no items in their inventory.');
                } else {
                    const start = page * itemsPerPage;
                    const end = start + itemsPerPage;
                    const itemsPage = inventory.slice(start, end);

                    embed.setDescription(chooseDescription);

                    for (const item of itemsPage) {
                        embed.addFields({
                            name: item.itemName,
                            value: `Quantity ${item.quantity}\nPurchased on: ${item.purchaseDate.toLocaleDateString()}`,
                            inline: false
                        });
                    }
                }
                return embed;
            };

            const message = await interaction.reply({
                embeds: [generateEmbed(currentPage)],
                components: [createButtonRow(currentPage, maxPages)],
                fetchReply: true,
            });

            const collector = message.createMessageComponentCollector();

            collector.on('collect', async (i) => {
                if (i.user.id === interaction.user.id) {

                    switch (i.customId) {
                        case 'first':
                            currentPage = 0;
                            break;
                        case 'previous':
                            currentPage = Math.max(currentPage - 1, 0);
                            break;
                        case 'next':
                            currentPage = Math.min(currentPage + 1, maxPages - 1);
                            break;
                        case 'last':
                            currentPage = maxPages - 1;
                            break;
                    }

                    await i.update({
                        embeds: [generateEmbed(currentPage)],
                        components: [createButtonRow(currentPage, maxPages)],
                    });

                } else {
                    const ephemeralEmbed = new EmbedBuilder()
                        .setDescription(`This inventory menu is controlled by <@${interaction.user.id}>. To use the buttons, you will have to run the command yourself.`)
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

        } catch (error) {
            console.log(`Error running /inventory: ${error}`);
            await interaction.reply({ content: 'There was an error fetching your inventory. Please try again later.', ephemeral: true });
        }
    }
};