const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'cat',
    description: 'Sends a random image of a cat!',

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    callback: async (client, interaction) => {
        try {
            // fetch image from TheCatAPI
            const response = await axios.get('https://api.thecatapi.com/v1/images/search',
                {
                    headers: {
                        'x-api-key': process.env.CAT_API_KEY
                    }
                });
            const catImageUrl = response.data[0].url;

            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle("Here's a cute kitty for you!")
                .setImage(catImageUrl);

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error fetching cat image: ${error}`);
            await interaction.reply(
                {
                    content: "Sorry, I couldn't fetch a cat image right now. Please try again later.",
                    ephemeral: true
                }
            );
        }
    }
}