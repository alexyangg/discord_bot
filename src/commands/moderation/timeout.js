const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'timeout',
    description: 'Timeout a user.',
    options: [
        {
            name: 'target-user',
            description: 'The user to timeout.',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'duration',
            description: 'Timeout duration, from 5 seconds to 28 days (5s, 1h, 1 day). ',
            type: ApplicationCommandOptionType.String,
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
        const duration = interaction.options.get('duration').value;
        const reason = interaction.options.get('reason')?.value || "No reason provided";

        const targetUser = await interaction.guild.members.fetch(mentionable);
        if (!targetUser) {
            await interaction.reply({ content: "That user doesn't exist in this server.", ephemeral: true });
            return;
        }

        if (targetUser.user.bot) {
            await interaction.reply({ content: "I can't timeout a bot.", ephemeral: true });
            return;
        }

        if (targetUser.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: "You cannot timeout an admin.", ephemeral: true });
            return;
        }

        const msDuration = ms(duration);

        if (isNaN(msDuration)) {
            await interaction.reply({ content: "Please provide a valid timeout duration.", ephemeral: true });
            return;
        }

        if (msDuration < 5000 || msDuration > 2.419e9) {
            await interaction.reply({ content: "Timeout duration cannot be less than 5 seconds or more than 28 days.", ephemeral: true });
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of target user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of user running the cmd
        const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

        if (targetUserRolePosition > requestUserRolePosition) {
            await interaction.reply({ content: "You can't timeout that user because they have a higher role than you.", ephemeral: true });
            return;
        }
        if (targetUserRolePosition === requestUserRolePosition) {
            await interaction.reply({ content: "You can't timeout that user because they have the same role as you.", ephemeral: true });
            return;
        }

        if (targetUserRolePosition > botRolePosition) {
            await interaction.reply({ content: "I can't timeout that user because they have a higher role than me.", ephemeral: true });
            return;
        }
        if (targetUserRolePosition === botRolePosition) {
            await interaction.reply({ content: "I can't timeout that user because they have the same role as me.", ephemeral: true });
            return;
        }

        await interaction.deferReply();

        // timeout the user
        try {
            const { default: prettyMs } = await import('pretty-ms');
            const embed = new EmbedBuilder()
                .setColor('#ffffff');

            if (targetUser.isCommunicationDisabled()) {
                await targetUser.timeout(msDuration, reason);
                embed.setDescription(`${targetUser}'s timeout has been updated to ${prettyMs(msDuration, { verbose: true })}.\nReason: ${reason}`);
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            await targetUser.timeout(msDuration, reason);
            embed.setDescription(`${targetUser} was timed out for ${prettyMs(msDuration, { verbose: true })}.\nReason: ${reason}`);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when timing out: ${error}`);
        }
    }
}