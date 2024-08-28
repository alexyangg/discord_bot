const { Client, Message } = require('discord.js'); // Enable IntelliSense
const path = require('path');
const Level = require(path.resolve(__dirname, '../../models/Level'));
const GuildSettings = require('../../models/GuildSettings');
const calculateLevelXp = require(path.resolve(__dirname, '../../utils/calculateLevelXp'));
const cooldowns = new Set();

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async (client, message) => {
    if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) {
        return;
    }

    const xpToGive = getRandomXp(5, 15);

    const query = {
        userId: message.author.id,
        guildId: message.guild.id,
    };

    try {
        const level = await Level.findOne(query);
        const settings = await GuildSettings.findOne({ guildId: message.guild.id });
        const levelUpMessageEnabled = settings?.levelUpMessageEnabled || true;

        // User has a level saved in database
        if (level) {
            level.xp += xpToGive;

            // If user has enough xp to level up, update data in database
            if (level.xp > calculateLevelXp(level.level)) {
                level.xp = 0;
                level.level += 1;

                if (levelUpMessageEnabled) {
                    message.channel.send(`${message.member} you have leveled up to **level ${level.level}**!`);
                }
            }

            await level.save().catch((e) => {
                console.log(`Error saving updated level ${e}`);
                return;
            });
            
            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 5000);

        } else { // User does not have a level saved in database, so create a level
            const newLevel = new Level({
                userId: message.author.id,
                guildId: message.guild.id,
                xp: xpToGive,
            });

            await newLevel.save();

            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 5000);
        }
    } catch (error) {
        console.log(`Error giving xp: ${error}`);
    }
};

