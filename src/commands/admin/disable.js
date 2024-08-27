const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
    name: 'disable',
    description: 'Disable commands or bot messages.',
    options: [
        {
            name: 'level-up',
            description: 'Disables level up messages for all users.',
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],

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

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (subcommand === 'level-up') {
            try {
                await interaction.deferReply();

                let settings = await GuildSettings.findOne({ guildId });
                if (!settings) {
                    settings = new GuildSettings({ guildId, levelUpMessageEnabled: false });
                } else {
                    if (!settings.levelUpMessageEnabled) {
                        await interaction.editReply(`Leveling-up messages are already disabled. To enable, use \`/enable level-up\`.`);
                        return;
                    }
                    settings.levelUpMessageEnabled = false;
                }
                await settings.save();
                await interaction.editReply(`Leveling-up messages are now disabled.`);
            } catch (error) {
                console.error(`Error updating level-up setting to false: ${error}`);
            }

        }

    }

}