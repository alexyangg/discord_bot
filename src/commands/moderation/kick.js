const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, DiscordAPIError, EmbedBuilder } = require('discord.js');

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

        // Try to find if the targetUser is in the server
        try {
            const targetUser = await interaction.guild.members.fetch(targetUserId);
        } catch (error) {
            if (error instanceof DiscordAPIError && error.message.includes("Unknown Member")) {
                await interaction.reply({ content: "An error occurred when kicking: that user is not in this server.", ephemeral: true });
            } else {
                console.log(`There was an error when kicking: ${error}`);
            }
        }

        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser) {
            await interaction.reply({ content: "That user doesn't exist in this server.", ephemeral: true });
            return;
        }

        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.reply({ content: "You can't kick the server owner.", ephemeral: true });
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of target user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of user running the cmd
        const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

        if (targetUserRolePosition > requestUserRolePosition) {
            await interaction.reply({ content: "You can't kick that user because they have a higher role than you.", ephemeral: true });
            return;
        }
        if (targetUserRolePosition === requestUserRolePosition) {
            await interaction.reply({ content: "You can't kick that user because they have the same role as you.", ephemeral: true });
            return;
        }

        if (targetUserRolePosition > botRolePosition) {
            await interaction.reply({ content: "I can't kick that user because they have a higher role than me.", ephemeral: true });
            return;
        }
        if (targetUserRolePosition === botRolePosition) {
            await interaction.reply({ content: "I can't kick that user because they have the same role as me.", ephemeral: true });
            return;
        }

        await interaction.deferReply();

        // Kick the targetUser
        try {
            const embed = new EmbedBuilder()
                .setColor('#ffffff');
            await targetUser.kick({ reason });
            embed.setDescription(`User ${targetUser} was kicked.\nReason: ${reason}`);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when kicking: ${error}`);
        }
    },
};