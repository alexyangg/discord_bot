const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'uptime',
    description: "Displays how long the bot has been online.",

    callback: (client, interaction) => {
        const totalSeconds = Math.floor(process.uptime());
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const seconds = totalSeconds % 60;

        const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setDescription(`I've been online for: **${uptime}**`);

        interaction.reply({ embeds: [embed] });
    },
};