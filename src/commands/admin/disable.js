const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const WelcomeChannel = require('../../models/WelcomeChannel');

module.exports = {
    name: 'disable',
    description: 'Disable commands or bot messages.',
    options: [
        {
            name: 'level-up',
            description: 'Disables level up messages for all users.',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'welcome',
            description: 'Removes the welcome message from being sent in the welcome channel.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'target-channel',
                    description: 'The channel to remove welcome messages from.',
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
                    required: true,
                },
            ],
        },
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

        } else if (subcommand === 'welcome') {
            try {
                const targetChannel = interaction.options.getChannel('target-channel');

                await interaction.deferReply();

                const query = {
                    guildId: interaction.guildId,
                    channelId: targetChannel.id,
                };

                const channelExistsInDb = await WelcomeChannel.exists(query);

                if (!channelExistsInDb) {
                    interaction.followUp('That channel has not been configured for welcome messages. To configure, run \`/setup welcome\`.');
                    return;
                }

                WelcomeChannel.findOneAndDelete(query)
                .then(() => {
                    interaction.followUp(`Removed ${targetChannel} from receiving welcome messages.`)
                })
                .catch((error) => {
                    interaction.followUp('Database error. Please try again in a moment.');
                    console.log(`DB error in ${__filename}:\n`, error);
                });

            } catch (error) {
                console.error(`Error updating welcome message setting to false: ${error}`);
            }
        }

    }

}