const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'inventory',
    description: 'View the itmes in your inventory.',
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

        try {
            let user = await User.findOne({ userId });

            if (!user) {
                user = new User({ userId });
                await user.save();
            }

            const inventory = user.inventory;

            const embed = new EmbedBuilder()
                .setTitle(`${targetUser.username}'s Inventory`)
                .setColor('#ffffff');

            if (inventory.length === 0) {
                embed.setDescription('This user has no items in their inventory.');
            } else {
                embed.setDescription('Here are the items in their inventory:');

                inventory.forEach(item => {
                    embed.addFields({
                        name: item.itemName,
                        value: `Quantity: ${item.quantity}\nPurchased on: ${item.purchaseDate.toLocaleDateString()}`,
                        inline: false
                    });
                });

            }
            
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.log(`Error running /inventory: ${error}`);
            await interaction.reply({ content: 'There was an error fetching your inventory. Please try again later.', ephemeral: true });
        }
    }
};