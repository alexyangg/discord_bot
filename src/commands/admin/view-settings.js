const { Client, Interaction, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const AutoRole = require('../../models/AutoRole');
const WelcomeChannel = require('../../models/WelcomeChannel');

module.exports = {
    name: 'view-settings',
    description: 'View the current settings for this server.',

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply('You can only run this command inside a server.');
            return;
        }

        const guildId = interaction.guild.id;

        try {
            await interaction.deferReply();

            // return settings as plain JS object for easier property access
            let guildSettings = await GuildSettings.findOne({ guildId }).lean();
            let autoRoleSettings = await AutoRole.findOne({ guildId }).lean();
            let welcomeChannelSettings = await WelcomeChannel.findOne({ guildId }).lean();

            if (!guildSettings) {
                guildSettings = new GuildSettings({ guildId });
            }

            // autorole settings
            let autoRole;
            if (!autoRoleSettings) {
                autoRole = 'Autorole not configured'
            } else {
                const role = interaction.guild.roles.cache.get(autoRoleSettings.roleId) ||
                    (await interaction.guild.roles.fetch(autoRoleSettings.roleId));
                autoRole = role ? role.name : 'Role not found';
            }

            // welcome message settings
            let channelId;
            let customMessage;
            if (!welcomeChannelSettings) {
                channelId = 'Welcome channel not configured'
                customMessage = 'Welcome message not configured'
            } else {
                const channel = interaction.guild.channels.cache.get(welcomeChannelSettings.channelId) ||
                    (await interaction.guild.channels.fetch(welcomeChannelSettings.channelId));
                channelId = channel ? channel.name : 'Channel not found';
                customMessage = welcomeChannelSettings?.customMessage ?? 'Hey {username}👋. Welcome to {server-name}!';
            }

            // XP settings
            const levelUpMessageEnabled = guildSettings.levelUpMessageEnabled ? 'Yes' : 'No';
            const minXpAmount = guildSettings.minXpAmount;
            const maxXpAmount = guildSettings.maxXpAmount;
            const xpCooldown = guildSettings.xpCooldown;

            const userGuildName = interaction.member.guild.name;
            const embed = new EmbedBuilder()
                .setTitle(`**${userGuildName} Server Settings**`)
                .setColor('#ffffff');

            const desc = `
            **Autorole Settings**
            Role: \`${autoRole}\`

            **Welcome Message Settings**
            Welcome Channel: \`${channelId}\`
            Welcome Message: \`${customMessage}\`
            
            **XP Settings**
            Level Up Messages Enabled: \`${levelUpMessageEnabled}\`
            Minimum XP: \`${minXpAmount}\`
            Maximum XP: \`${maxXpAmount}\`
            XP Cooldown: \`${xpCooldown}ms\`
            `;

            if (desc !== "") {
                embed.setDescription(desc);
                interaction.editReply({ embeds: [embed] });
            } else {
                interaction.editReply("I couldn't display the settings.");
                return;
            }
        } catch (error) {
            console.log(`Error viewing settings: ${error}`);
            interaction.editReply('There was an error retrieving the settings. Please try again.');
        }
    }
}