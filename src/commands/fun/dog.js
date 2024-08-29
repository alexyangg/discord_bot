const { Client, CommandInteraction } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'dog',
    description: 'Sends a random image of a dog!',

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    callback: async (client, interaction) => {
        try {
            // fetch image from TheDogAPI
            const response = await axios.get('https://api.thedogapi.com/v1/images/search',
                {
                    headers: {
                        'x-api-key': process.env.DOG_API_KEY
                    }
                });
            const dogImageUrl = response.data[0].url;

            await interaction.reply(
                {
                    content: 'Here\'s a cute doggo for you!',
                    files: [dogImageUrl]
                }
            );
        } catch (error) {
            console.error(`Error fetching dog image: ${error}`);
            await interaction.reply(
                {
                    content: "Sorry, I couldn't fetch a dog image right now. Please try again later.",
                    ephemeral: true
                }
            );
        }
    }
}