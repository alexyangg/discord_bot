const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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

        const targetUser = await interaction.guild.members.fetch(mentionable);
        if (!targetUser) {
            await interaction.reply({ content: "That user doesn't exist in this server.", ephemeral: true });
            return;
        }

        if (targetUser.user.bot) {
            await interaction.reply({ content: "I can't remove a timeout from a bot.", ephemeral: true });
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of target user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of user running the cmd
        const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

        if (targetUserRolePosition > requestUserRolePosition) {
            await interaction.reply({ content: "You can't remove a timeout from that user because they have a higher role than you.", ephemeral: true });
            return;
        }
        if (targetUserRolePosition === requestUserRolePosition) {
            await interaction.reply({ content: "You can't remove a timeout from that user because they have the same role as you.", ephemeral: true });
            return;
        }

        if (targetUserRolePosition > botRolePosition) {
            await interaction.reply({ content: "I can't remove a timeout from that user because they have a higher role than me.", ephemeral: true });
            return;
        }
        if (targetUserRolePosition === botRolePosition) {
            await interaction.reply({ content: "I can't remove a timeout from that user because they have the same role as me.", ephemeral: true });
            return;
        }

        await interaction.deferReply();

        // remove the timeout from the user
        try {
            const embed = new EmbedBuilder()
                .setColor('#ffffff');

            if (!targetUser.isCommunicationDisabled()) {
                embed.setDescription(`${targetUser} is not currently timed out.`);
                await interaction.editReply({ embeds: [embed] });
                return;
            }

            await targetUser.timeout(null, reason);
            embed.setDescription(`${targetUser}'s timeout has been removed.\nReason: ${reason}`);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when removing the time out: ${error}`);
        }
    }
}