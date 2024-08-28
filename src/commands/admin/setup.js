const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType } = require('discord.js');
const WelcomeChannel = require('../../models/WelcomeChannel');

module.exports = {
    name: 'setup',
    description: 'Setup commands.',
    options: [
        {
            name: 'welcome',
            description: 'Setup a channel to send welcome messages.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'channel',
                    description: 'The channel to send welcome messages.',
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
                    required: true,
                },
                {
                    name: 'custom-message',
                    description: 'Fields: {mention-member} {username} {server-name} {member-count}',
                    type: ApplicationCommandOptionType.String,
                    default: null,
                }
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

        if (subcommand === 'welcome') {
            try {
                const targetChannel = interaction.options.getChannel('channel');
                const customMessage = interaction.options.getString('custom-message');
                await interaction.deferReply();

                const query = {
                    guildId: interaction.guildId,
                    channelId: targetChannel.id,
                };

                const channelExistsInDb = await WelcomeChannel.exists(query);

                if (channelExistsInDb) {
                    interaction.followUp(`This channel has already been configured for welcome messages. To change the welcome message, run \`/disable welcome\` and \`/setup welcome\`.`);
                    return;
                }

                const newWelcomeChannel = new WelcomeChannel({
                    ...query,
                    customMessage,
                });

                newWelcomeChannel
                    .save()
                    .then(() => {
                        if (!(customMessage === null)) {
                            interaction.followUp(`Configured ${targetChannel} to receive \`${customMessage}\` as a welcome message.`);
                        } else {
                            interaction.followUp(`Configured ${targetChannel} to receive the default welcome message: \`Hey {username}👋. Welcome to {server-name}!\``);
                        }
                        
                    })
                    .catch((error) => {
                        interaction.followUp('Database error. Please try again in a moment.');
                        console.log(`DB error in ${__filename}:\n`, error);
                    });

            } catch (error) {
                console.log(`Error in ${__filename}:\n`, error);
            }

        }

    }

}