const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'invite',
    description: "Invite me to your server!",

    callback: async (client, interaction) => {
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=859496216256970762`;

        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setDescription(`Here is my [invite link](${inviteUrl})!`);
        interaction.reply({ embeds: [embed], ephemeral: true });
    },
};