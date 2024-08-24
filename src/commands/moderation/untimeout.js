const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'untimeout',
    description: 'Untimeout a user.',
    options: [
        {
            name: 'target-user',
            description: 'The user to untimeout.',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'reason',
            description: 'The reason for the timeout.',
            type: ApplicationCommandOptionType.String,
        },
    ],
    permissionsRequired: [PermissionFlagsBits.MuteMembers],
    botPermissions: [PermissionFlagsBits.MuteMembers],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const mentionable = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || "No reason provided";

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(mentionable);
        if (!targetUser) {
            await interaction.editReply("That user doesn't exist in this server.");
            return;
        }

        if (targetUser.user.bot) {
            await interaction.editReply("I can't remove a timeout from a bot.");
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of target user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of user running the cmd
        const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

        if (targetUserRolePosition > requestUserRolePosition) {
            await interaction.editReply("You can't remove a timeout from that user because they have a higher role than you.");
            return;
        }
        if (targetUserRolePosition === requestUserRolePosition) {
            await interaction.editReply("You can't remove a timeout from that user because they have the same role as you.");
            return;
        }

        if (targetUserRolePosition > botRolePosition) {
            await interaction.editReply("I can't remove a timeout from that user because they have a higher role than me.");
            return;
        }
        if (targetUserRolePosition === botRolePosition) {
            await interaction.editReply("I can't remove a timeout from that user because they have the same role as me.");
            return;
        }

        // remove the timeout from the user
        try {
            if (!targetUser.isCommunicationDisabled()) {
                await interaction.editReply(`${targetUser} is not currently timed out.`);
                return;
            }

            await targetUser.timeout(null, reason);
            await interaction.editReply(`${targetUser}'s timeout has been removed.\nReason: ${reason}`);
        } catch (error) {
            console.log(`There was an error when removing the time out: ${error}`);
        }
    }
}