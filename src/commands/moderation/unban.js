const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unbans a member from the server.',
    permissionsRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],
    options: [
        {
            name: 'target-user',
            description: 'The user to unban.',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'reason',
            description: 'The reason for unbanning.',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
    ],

    /**
     * @param {Client} client
     * @param {Interaction} interaction
     */

    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || 'No reason provided.';

        await interaction.deferReply();

        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            await interaction.editReply('You do not have permission to unban members.');
            return;
        }

        try {
            const bannedUsers = await interaction.guild.bans.fetch();
            const banInfo = bannedUsers.find(ban => ban.user.id === targetUserId);

            if (!banInfo) {
                await interaction.editReply(`User with ID ${targetUserId} is not banned.`);
                return;
            }

            // Unban the targetUser
            await interaction.guild.members.unban(targetUserId, reason);
            await interaction.editReply(`Unbanned ${banInfo.user.tag}.\nReason: ${reason}`);
        } catch (error) {
            console.log(`There was an error when unbanning: ${error}`);
        }
    },
};