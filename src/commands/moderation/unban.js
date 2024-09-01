const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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

        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            await interaction.reply({ content: 'You do not have permission to unban members.', ephemeral: true });
            return;
        }

        await interaction.deferReply();

        try {
            const embed = new EmbedBuilder()
                .setColor('#ffffff');
            const bannedUsers = await interaction.guild.bans.fetch();
            const banInfo = bannedUsers.find(ban => ban.user.id === targetUserId);

            if (!banInfo) {
                embed.setDescription(`User with ID ${targetUserId} is not banned.`);
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // Unban the targetUser
            await interaction.guild.members.unban(targetUserId, reason);
            embed.setDescription(`Unbanned ${banInfo.user.tag}.\nReason: ${reason}`);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when unbanning: ${error}`);
        }
    },
};