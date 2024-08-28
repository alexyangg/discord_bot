const { Client, GuildMember } = require('discord.js');
const WelcomeChannel = require('../../models/WelcomeChannel');

/**
 * 
 * @param {GuildMember} guildMember 
 */
module.exports = async (client, guildMember) => {
    try {
        if (guildMember.user.bot) {
            return;
        }

        const welcomeConfigs = await WelcomeChannel.find({
            guildId: guildMember.guild.id,
        });

        // if array from welcomeConfigs is empty, do nothing
        if (!welcomeConfigs.length) {
            return;
        }

        // loop through all the welcome messages configured for the server
        for (const welcomeConfig of welcomeConfigs) {
            const targetChannel = guildMember.guild.channels.cache.get(welcomeConfig.channelId) ||
                (await guildMember.guild.channels.fetch(welcomeConfig.channelId));

            if (!targetChannel) {
                WelcomeChannel.findOneAndDelete({
                    guildId: guildMember.guild.id,
                    channelId: welcomeConfig.channelId,
                }).catch(() => { });
                continue; // skip this iteration since the channel doesn't exist
            }

            const customMessage = welcomeConfig.customMessage || "Hey {mention-member} 👋. Welcome to {server-name}!";
            const welcomeMessage = customMessage
                .replace('{mention-member}', `<@${guildMember.id}>`)
                .replace('{username}', guildMember.user.username)
                .replace('{server-name}', guildMember.guild.name)
                .replace('{member-count}', String(guildMember.guild.memberCount));

            try {
                await targetChannel.send(welcomeMessage);
            } catch (error) {
                console.log(`I don't have enough permissions to send the welcome message: ${error}`);
            }
        }
    } catch (error) {
        console.log(`Error in ${__filename}:\n`, error);
    }
}