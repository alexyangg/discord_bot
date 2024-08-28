const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'simulate-join',
    description: "Simulate a member joining.",
    options: [
        {
            name: 'target-user',
            description: 'The user you want to emulate joining.',
            type: ApplicationCommandOptionType.Mentionable
        },
    ],


    callback: async (client, interaction) => {
        const targetUser = interaction.options.getUser('target-user');

        let member;

        if (targetUser) {
            member =
                interaction.guild.members.cache.get(targetUser.id) ||
                (await interaction.guild.members.fetch(targetUser.id));
        } else {
            member = interaction.member;
        }

        client.emit('guildMemberAdd', member);

        interaction.reply('Simulated join!');
    },
};