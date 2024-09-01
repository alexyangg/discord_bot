const { Client, Interaction, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'joke',
    description: 'Sends a random joke!',

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        try {
            // fetch image from the Official Joke API
            const response = await axios.get('https://official-joke-api.appspot.com/jokes/random');
            const joke = response.data;

            const embed = new EmbedBuilder()
                .setDescription(`${joke.setup}\n\n**${joke.punchline}**`)
                .setColor('#ffffff');

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error(`Error fetching joke: ${error}`);
            await interaction.reply(
                {
                    content: "Sorry, I couldn't fetch a joke right now. Please try again later.",
                    ephemeral: true
                }
            );
        }
    }
}