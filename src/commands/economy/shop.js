const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    name: 'shop',
    description: 'View and buy items from the shop.',
    options: [
        {
            name: 'view',
            description: 'View the items available in the shop.',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'buy',
            description: 'Buy an item from the shop.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'item',
                    description: 'The item you want to buy.',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'Teddy Bear', value: 'teddy_bear' },
                        { name: 'Honey Pot', value: 'honey_pot' },
                        { name: 'Sword', value: 'sword' },
                        { name: 'Magic Wand', value: 'magic_wand' },
                        { name: 'Computer', value: 'computer' },
                        { name: 'Moai', value: 'moai' },
                        { name: 'Diamond Ring', value: 'diamond_ring' },
                        { name: 'Watch', value: 'watch' },
                        { name: 'Car', value: 'car' },
                        { name: 'Supercar', value: 'supercar' },
                        { name: 'House', value: 'house' },
                        { name: 'Mansion', value: 'mansion' },
                        { name: 'Private Island', value: 'private_island' }
                    ],
                }
            ],
        },
    ],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        const shopItems = [
            { name: 'Teddy Bear 🧸', price: 10, description: 'A cute and cuddly teddy bear to keep you company.' },
            { name: 'Honey Pot 🍯', price: 30, description: 'A sweet and delicious pot of honey, perfect for a snack.' },
            { name: 'Sword ⚔️', price: 100, description: 'A sharp and sturdy sword for defending yourself in battle.' },
            { name: 'Magic Wand 🪄', price: 150, description: 'A powerful wand that can cast a variety of magical spells.' },
            { name: 'Computer 🖥️', price: 1000, description: 'A high-performance computer for all your gaming needs.' },
            { name: 'Moai 🗿', price: 5000, description: 'A mysterious statue from Easter Island that adds a unique touch to your collection.' },
            { name: 'Diamond Ring 💍', price: 10000, description: 'A luxurious diamond ring that sparkles brilliantly.' },
            { name: 'Watch ⌚', price: 15000, description: 'A luxurious timepiece that combines style with precision.' },
            { name: 'Car 🚗', price: 40000, description: 'A reliable vehicle to get you wherever you need to go in style.' },
            { name: 'Supercar 🏎️', price: 100000, description: 'A sleek and fast supercar that turns heads wherever you drive.' },
            { name: 'House 🏠', price: 500000, description: 'A comfortable and spacious house to call your own.' },
            { name: 'Mansion 🏡', price: 1000000, description: 'An extravagant mansion with everything you could ever want.' },
            { name: 'Private Island 🏝️', price: 5000000, description: 'Your own private paradise, secluded from the world and surrounded by crystal-clear waters.' },
        ];

        switch (subcommand) {
            case 'view':
                let currentPage = 0;
                const itemsPerPage = 5;
                const maxPages = Math.ceil(shopItems.length / itemsPerPage);

                const generateShopEmbed = (page) => {
                    const embed = new EmbedBuilder()
                        .setTitle('Shop Items')
                        .setColor('#ffffff')
                        .setDescription('Here are the items you can buy:')
                        .setFooter({ text: `Page ${page + 1} of ${maxPages}` });

                    const start = page * itemsPerPage;
                    const end = start + itemsPerPage;
                    const itemsPage = shopItems.slice(start, end); // num items on a single page

                    for (const item of itemsPage) {
                        embed.addFields({ name: item.name, value: `${item.description}\nPrice: ${item.price.toLocaleString()} coins`, inline: false });
                    }

                    return embed;
                };

                const createButtonRow = () => {
                    return new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('first')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('⏮️')
                                .setDisabled(currentPage === 0),
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('⬅️')
                                .setDisabled(currentPage === 0),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('➡️')
                                .setDisabled(currentPage === maxPages - 1),
                            new ButtonBuilder()
                                .setCustomId('last')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('⏭️')
                                .setDisabled(currentPage === maxPages - 1),
                        );
                };

                const message = await interaction.reply({ embeds: [generateShopEmbed(currentPage)], components: [createButtonRow()], fetchReply: true });

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
                            embeds: [generateShopEmbed(currentPage)],
                            components: [createButtonRow()],
                        });

                    } else {
                        i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                    }
                });

                collector.on('end', async () => {
                    await interaction.editReply({ components: [] });
                });

                break;

            case 'buy':

                const addItemToInventory = async (userId, itemName) => {
                    let user = await User.findOne({ userId });
                    console.log(itemName);
                    console.log(user)
                    if (!user) {
                        user = new User({ userId, inventory: [] }); // Initialize inventory if user is new
                      }
                    
                      // Check if inventory exists, initialize if not
                      if (!user.inventory) {
                        user.inventory = [];
                      }

                    const itemIndex = user.inventory.findIndex(item => item.itemName === itemName);

                    if (itemIndex !== -1) {
                        // item already exists, increase quantity
                        user.inventory[itemIndex].quantity += 1;
                    } else {
                        user.inventory.push({ itemName: itemName, quantity: 1, purchaseDate: new Date() });
                    }

                    await user.save();
                }

                // remove emojis and invisible characters from the item name
                const removeEmojis = (str) => str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu, '').trim();

                const itemValue = interaction.options.getString('item');
                // console.log(`Item selected by user: ${itemValue}`);

                // compare user selected item value with normalized shop item name
                const shopItem = shopItems.find(i => {
                    const normalizedItemName = removeEmojis(i.name).toLocaleLowerCase().replace(/\s+/g, '_');
                    // console.log(`Comparing user selection (${itemValue}) with shop item (${normalizedItemName})`);
                    return normalizedItemName === itemValue;
                });

                const embed = new EmbedBuilder()
                    .setColor('#ffffff');

                if (!shopItem) {
                    embed.setDescription('This item does not exist in the shop.');
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    return;
                }

                try {
                    let user = await User.findOne({ userId });

                    if (!user) {
                        user = new User({ userId });
                        await user.save();
                    }

                    if (user.balance < shopItem.price) {
                        embed.setDescription(`You do not have enough coins to buy ${shopItem.name}.`);
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        return;
                    }

                    user.balance -= shopItem.price;
                    addItemToInventory(userId, shopItem.name);
                    await user.save();

                    embed.setDescription(`You have successfully bought a **${shopItem.name}** for ${shopItem.price} coins!`);
                    await interaction.reply({ embeds: [embed] });
                } catch (error) {
                    console.log(`Error running /shop buy: ${error}`);
                    await interaction.reply({ content: 'There was an error processing your purchase. Please try again later.', ephemeral: true });
                }

                break;
        }
    }
}