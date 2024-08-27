const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
    name: 'enable',
    description: 'Enables commands or bot messages.',
    options: [
        {
            name: 'level-up',
            description: 'Enables level up messages for all users.',
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
                    settings = new GuildSettings({ guildId, levelUpMessageEnabled: true });
                } else {
                    if (settings.levelUpMessageEnabled) {
                        await interaction.editReply(`Leveling-up messages are already enabled. To disable, use \`/disable level-up\`.`);
                        return;
                    }
                    settings.levelUpMessageEnabled = true;
                }
                await settings.save();
                await interaction.editReply(`Leveling-up messages are now enabled.`);
            } catch (error) {
                console.error(`Error updating level-up setting to true: ${error}`);
            }

        }

    }

}