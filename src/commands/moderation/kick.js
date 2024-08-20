const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, DiscordAPIError, } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kicks a member from the server.',
    permissionsRequired: [PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.KickMembers],
    options: [
        {
            name: 'target-user',
            description: 'The user to kick.',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'reason',
            description: 'The reason for kicking.',
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

        // Try to find if the targetUser is in the server
        try {
            const targetUser = await interaction.guild.members.fetch(targetUserId);
        } catch (error) {
            if (error instanceof DiscordAPIError && error.message.includes("Unknown Member")) {
                await interaction.editReply("An error occurred when kicking: that user is not in this server.");
            } else {
                console.log(`There was an error when kicking: ${error}`);
            }
        }

        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser) {
            await interaction.editReply("That user doesn't exist in this server.");
            return;
        }

        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.editReply("You can't kick the server owner.");
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of target user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of user running the cmd
        const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

        if (targetUserRolePosition > requestUserRolePosition) {
            await interaction.editReply("You can't kick that user because they have a higher role than you.");
            return;
        }
        if (targetUserRolePosition === requestUserRolePosition) {
            await interaction.editReply("You can't kick that user because they have the same role as you.");
            return;
        }
        
        if (targetUserRolePosition > botRolePosition) {
            await interaction.editReply("I can't kick that user because they have a higher role than me.");
            return;
        }
        if (targetUserRolePosition === botRolePosition) {
            await interaction.editReply("I can't kick that user because they have the same role as me.");
            return;
        }

        // Kick the targetUser
        try {
            await targetUser.kick({ reason });
            await interaction.editReply(`User ${targetUser} was kicked.\nReason: ${reason}`);
        } catch (error) {
            console.log(`There was an error when kicking: ${error}`);
        }
    },
};