const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType, EmbedBuilder } = require('discord.js');
const WelcomeChannel = require('../../models/WelcomeChannel');
const GuildSettings = require('../../models/GuildSettings');
const AutoRole = require('../../models/AutoRole');

module.exports = {
    name: 'configure',
    description: 'Configure commands.',
    options: [
        {
            name: 'welcome',
            description: 'Setup a channel to send welcome messages.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'channel',
                    description: 'Configure the channel to send welcome messages.',
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
                    name: 'disable',
                    description: 'Disable welcome messages in this server.',
                    type: ApplicationCommandOptionType.Subcommand,
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
        {
            name: 'autorole',
            description: 'Configure the role to be given to new members.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'role',
                    description: 'The role assigned to users when they join this server.',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'role',
                            description: 'The role assigned to users when they join this server.',
                            type: ApplicationCommandOptionType.Role,
                            required: true,
                        }
                    ]
                },
                {
                    name: 'disable',
                    description: 'Disable autorole in this server.',
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ],
            botPermissions: [PermissionFlagsBits.ManageRoles],
        },
        {
            name: 'level-messages',
            description: 'Enable/disable level up messages for all users.',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'enable',
                    description: 'Enables level up messages for all users.',
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'disable',
                    description: 'Disables level up messages for all users.',
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
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

        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        const embed = new EmbedBuilder()
            .setColor('#ffffff');

        await interaction.deferReply();

        switch (subcommandGroup) {
            case 'welcome':
                switch (subcommand) {
                    case 'channel':
                        try {
                            const targetChannel = interaction.options.getChannel('channel');
                            const customMessage = interaction.options.getString('custom-message');
                            // await interaction.deferReply();

                            const existingWelcomeChannel = await WelcomeChannel.findOne({ guildId });

                            if (existingWelcomeChannel) {
                                embed.setDescription(`A welcome channel is already configured for this server: <#${existingWelcomeChannel.channelId}>. To change channels, first run \`/configure welcome disable\` and then \`/configure welcome channel\`.`);
                                interaction.editReply({ embeds: [embed] });
                                return;
                            }

                            const query = {
                                guildId: interaction.guildId,
                                channelId: targetChannel.id,
                            };

                            const newWelcomeChannel = new WelcomeChannel({
                                ...query,
                                customMessage,
                            });

                            newWelcomeChannel
                                .save()
                                .then(() => {
                                    if (!(customMessage === null)) {
                                        embed.setDescription(`Configured ${targetChannel} to receive \`${customMessage}\` as a welcome message.`);
                                        interaction.editReply({ embeds: [embed] });
                                    } else {
                                        embed.setDescription(`Configured ${targetChannel} to receive the default welcome message: \`Hey {username}👋. Welcome to {server-name}!\``);
                                        interaction.editReply({ embeds: [embed] });
                                    }

                                })
                                .catch((error) => {
                                    embed.setDescription('Database error. Please try again in a moment.');
                                    interaction.followUp({ embeds: [embed] });
                                    console.log(`DB error in ${__filename}:\n`, error);
                                });

                        } catch (error) {
                            console.log(`Error in /configure welcome channel: ${error}`);
                            embed.setDescription(`There was an error configuring the welcome channel. Please try again later.`);
                            interaction.editReply({ embeds: [embed] });
                        }
                        break;

                    case 'disable':
                        try {
                            // await interaction.deferReply();

                            const query = {
                                guildId: interaction.guildId,
                            };

                            WelcomeChannel.findOneAndDelete(query)
                                .then(() => {
                                    embed.setDescription('Disabled welcome messages.');
                                    interaction.editReply({ embeds: [embed] });
                                })
                                .catch((error) => {
                                    embed.setDescription('Database error. Please try again in a moment.');
                                    interaction.editReply({ embeds: [embed] });
                                    console.log(`DB error in ${__filename}:\n`, error);
                                });

                        } catch (error) {
                            console.error(`Error in /configure welcome disable: ${error}`);
                            embed.setDescription(`There was an error disabling welcome messages. Please try again later.`);
                            interaction.editReply({ embeds: [embed] });
                        }
                        break;
                }
                break;

            case 'autorole':
                switch (subcommand) {
                    case 'role':
                        const targetRoleId = interaction.options.get('role').value;
                        const targetRole = interaction.guild.roles.cache.get(targetRoleId);

                        try {
                            // await interaction.deferReply();

                            let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

                            // check if autoRole exists in the database
                            if (autoRole) {
                                if (autoRole.roleId === targetRoleId) {
                                    embed.setDescription(`Autorole has already been configured for \`@${targetRole.name}\`. To disable, run \`/configure autorole disable\`, or change the role by running \`/configure autorole role\` again.`);
                                    interaction.editReply({ embeds: [embed] });
                                    return;
                                } else {
                                    autoRole.roleId = targetRoleId;
                                    await autoRole.save();
                                    embed.setDescription(`Autorole has been updated to \`@${targetRole.name}\`.`);
                                    interaction.editReply({ embeds: [embed] });
                                    return;
                                }
                            } else {
                                autoRole = new AutoRole({
                                    guildId: interaction.guild.id,
                                    roleId: targetRoleId,
                                });
                                await autoRole.save();
                                embed.setDescription(`Autorole has now been configured to \`@${targetRole.name}\`. To disable, run \`/configure autorole disable\`.`);
                                interaction.editReply({ embeds: [embed] });
                            }
                        } catch (error) {
                            console.log(`An error occurred with /configure autorole role: ${error}`);
                            embed.setDescription(`There was an error configuring autorole. Please try again later.`);
                            interaction.editReply({ embeds: [embed] });
                        }
                        break;

                    case 'disable':
                        try {
                            // await interaction.deferReply();

                            if (!(await AutoRole.exists({ guildId: interaction.guild.id }))) {
                                embed.setDescription('Autorole has not been configured for this server. Use `/configure autorole role` to set it up.');
                                interaction.editReply({ embeds: [embed] });
                                return;
                            }

                            await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
                            embed.setDescription('Autorole has been disabled for this server. Use `/configure autorole role` to set it up again.');
                            interaction.editReply({ embeds: [embed] });
                        } catch (error) {
                            console.log(`An error occurred with /configure autorole disable: ${error}`);
                            embed.setDescription(`There was an error disabling autorole. Please try again later.`);
                            interaction.editReply({ embeds: [embed] });
                        }
                        break;
                }
                break;

            case 'level-messages':
                switch (subcommand) {
                    case 'enable':
                        try {
                            // await interaction.deferReply();

                            let settings = await GuildSettings.findOne({ guildId });
                            if (!settings) {
                                settings = new GuildSettings({ guildId, levelUpMessageEnabled: true });
                            } else {
                                if (settings.levelUpMessageEnabled) {
                                    embed.setDescription(`Leveling-up messages are already enabled. To disable, use \`/configure level-messages disable\`.`);
                                    await interaction.editReply({ embeds: [embed] });
                                    return;
                                }
                                settings.levelUpMessageEnabled = true;
                            }
                            await settings.save();
                            embed.setDescription(`Leveling-up messages are now enabled.`);
                            await interaction.editReply({ embeds: [embed] });
                        } catch (error) {
                            console.error(`Error with /configure level-messages enable: ${error}`);
                            embed.setDescription(`There was an error enabling level-up messages. Please try again later.`);
                            interaction.editReply({ embeds: [embed] });
                        }
                        break;

                    case 'disable':
                        try {
                            // await interaction.deferReply();

                            let settings = await GuildSettings.findOne({ guildId });
                            if (!settings) {
                                settings = new GuildSettings({ guildId, levelUpMessageEnabled: false });
                            } else {
                                if (!settings.levelUpMessageEnabled) {
                                    embed.setDescription(`Leveling-up messages are already disabled. To enable, use \`/configure level-messages enable\`.`);
                                    await interaction.editReply({ embeds: [embed] });
                                    return;
                                }
                                settings.levelUpMessageEnabled = false;
                            }
                            await settings.save();
                            embed.setDescription(`Leveling-up messages are now disabled.`);
                            await interaction.editReply({ embeds: [embed] });
                        } catch (error) {
                            console.error(`Error with /configure level-messages disable: ${error}`);
                            embed.setDescription(`There was an error disabling level-up messages. Please try again later.`);
                            interaction.editReply({ embeds: [embed] });
                        }
                        break;
                }
                break;
        }

        switch (subcommand) {
            case 'xp-settings':
                try {
                    let settings = await GuildSettings.findOne({ guildId });

                    if (!settings) {
                        settings = new GuildSettings({
                            guildId,
                            // levelUpMessageEnabled,
                            // minXpAmount,
                            // maxXpAmount,
                            // xpCooldown,
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
                        embed.setDescription('The minimum XP must be less than the maximum XP. Please try again with different values.');
                        interaction.editReply({ embeds: [embed] });
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
                        embed.setDescription('Error updating settings: \`minimum-xp\` must be an integer greater than 0.');
                        interaction.editReply({ embeds: [embed] });
                        return;
                    }

                    if (maxXp < 0) {
                        embed.setDescription('Error updating settings: \`maximum-xp\` must be an integer greater than 0.');
                        interaction.editReply({ embeds: [embed] });
                        return;
                    }

                    if (xpCooldown < 0) {
                        embed.setDescription('Error updating settings: \`xp-cooldown\` must be an integer greater than 0.');
                        interaction.editReply({ embeds: [embed] });
                        return;
                    }

                    embed.setDescription(`XP settings updated:\nMin XP: ${previousMinXp} XP => **${minXp}** XP\nMax XP: ${previousMaxXp} XP => **${maxXp}** XP\nCooldown: ${previousXpCooldown}ms => **${xpCooldown}**ms`);

                    await settings.save();
                    interaction.editReply({ embeds: [embed] });

                } catch (error) {
                    console.log(`Error with /configure xp-settings: ${error}`);
                    embed.setDescription('There was an error updating the XP settings. Please try again.');
                    interaction.editReply({ embeds: [embed] });
                }
                break;
        }
    }

}