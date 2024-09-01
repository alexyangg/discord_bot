const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: "Replies with the bot's latency information.",
    // devOnly: Boolean,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,

    callback: async (client, interaction) => {
        await interaction.deferReply();

        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setDescription(`Pong! Client: ${ping}ms | Websocket: ${client.ws.ping}ms`);
        interaction.editReply({ embeds: [embed] });
    },
};