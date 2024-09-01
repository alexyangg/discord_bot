const { Client, CommandInteraction, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'meme',
    description: 'Sends a random meme!',

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    callback: async (client, interaction) => {
        try {
            // fetch image from Meme API
            const response = await axios.get('https://meme-api.com/gimme');
            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle(response.data.title)
                .setImage(response.data.url);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.log(`Error fetching meme: ${error}`);
            await interaction.reply(
                {
                    content: "Sorry, I couldn't fetch a meme right now. Please try again later.",
                    ephemeral: true
                }
            );
        }
    }

}