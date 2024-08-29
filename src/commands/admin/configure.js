const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType } = require('discord.js');
const WelcomeChannel = require('../../models/WelcomeChannel');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
    name: 'configure',
    description: 'Configure commands.',
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
        {
            name: 'xp-settings',
            description: 'Configure min/max XP given for a message and XP cooldowns',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'minimum-xp',
                    description: 'Set the minimum amount of XP to be given for each message. (Default: 5)',
                    type: ApplicationCommandOptionType.Integer,
                },
                {
                    name: 'maximum-xp',
                    description: 'Set the maximum amount of XP to be given for each message. (Default: 15)',
                    type: ApplicationCommandOptionType.Integer,
                },
                {
                    name: 'xp-cooldown',
                    description: 'Set the cooldown time (in milliseconds) between XP given for messages. (Default: 5000)',
                    type: ApplicationCommandOptionType.Integer,
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

        switch (subcommand) {
            case 'welcome':
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
                break;

            case 'xp-settings':
                try {
                    let settings = await GuildSettings.findOne({ guildId });

                    if (!settings) {
                        settings = new GuildSettings({
                            guildId,
                            levelUpMessageEnabled,
                            minXpAmount,
                            maxXpAmount,
                            xpCooldown,
                        });
                    }

                    let minXp = interaction.options.getInteger('minimum-xp');
                    let maxXp = interaction.options.getInteger('maximum-xp');
                    let xpCooldown = interaction.options.getInteger('xp-cooldown');

                    // store the values of the current settings before they are updated
                    const previousMinXp = settings.minXpAmount;
                    const previousMaxXp = settings.maxXpAmount;
                    const previousXpCooldown = settings.xpCooldown;

                    let effectiveMinXp;
                    let effectiveMaxXp;

                    // if user sets a number in the config command, 
                    // use that number, otherwise use number from settings
                    if (minXp !== null) {
                        effectiveMinXp = minXp;
                    } else {
                        effectiveMinXp = settings.minXpAmount;
                    }
                    if (maxXp !== null) {
                        effectiveMaxXp = maxXp;
                    } else {
                        effectiveMaxXp = settings.maxXpAmount;
                    }

                    if (effectiveMinXp > effectiveMaxXp) {
                        interaction.reply('The minimum XP must be less than the maximum XP. Please try again with different values.');
                        return;
                    }

                    // update settings only if new value is provided
                    if (minXp !== null) {
                        settings.minXpAmount = minXp;
                    } else {
                        minXp = previousMinXp;
                    }

                    if (maxXp !== null) {
                        settings.maxXpAmount = maxXp;
                    } else {
                        maxXp = previousMaxXp;
                    }

                    if (xpCooldown !== null) {
                        settings.xpCooldown = xpCooldown;
                    } else {
                        xpCooldown = previousXpCooldown;
                    }

                    if (minXp < 0) {
                        interaction.reply('Error updating settings: minimum-xp must be an integer greater than 0.');
                        return;
                    }

                    if (maxXp < 0) {
                        interaction.reply('Error updating settings: maximum-xp must be an integer greater than 0.');
                        return;
                    }

                    if (xpCooldown < 0) {
                        interaction.reply('Error updating settings: xp-cooldown must be an integer greater than 0.');
                        return;
                    }

                    await settings.save();
                    interaction.reply(`XP settings updated:\nMin XP: ${previousMinXp} XP => **${minXp}** XP\nMax XP: ${previousMaxXp} XP => **${maxXp}** XP\nCooldown: ${previousXpCooldown}ms => **${xpCooldown}**ms`);

                } catch (error) {
                    console.log(`Error in ${__filename}:\n`, error);
                    interaction.reply('There was an error updating the XP settings. Please try again.');
                }
                break;
        }
    }

}