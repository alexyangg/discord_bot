const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = (currentPage, maxPages) => {

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

}
