const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder } = require("discord.js");
const Level = require("../../models/Level");
const calculateLevelXp = require('../../utils/calculateLevelXp');
const canvacord = require('canvacord');
const { Font, RankCardBuilder } = require('canvacord');
const path = require('path');

module.exports = {
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

        await interaction.deferReply();

        const mentionedUserId = interaction.options.get('target-user')?.value;
        const targetUserId = mentionedUserId || interaction.member.id;
        const targetUserObject = await interaction.guild.members.fetch(targetUserId);

        const fetchedLevel = await Level.findOne({
            userId: targetUserId,
            guildId: interaction.guild.id,
        });

        if (!fetchedLevel) {
            interaction.editReply(
                mentionedUserId ?
                    `${targetUserObject.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
                    : "You don't have any levels yet. Chat a little more and try again."
            );
            return;
        }

        // query database based on given fields
        let allLevels = await Level.find({ guildId: interaction.guild.id }).select('-_id userId level xp');

        allLevels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp; // compare xp if levels are the same
            } else {
                return b.level - a.level;
            }
        });

        // determine rank in sorted array based on user's id
        let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

        const customFontPath = path.resolve(__dirname, '../../fonts/LeagueSpartan-Bold.ttf');
        Font.fromFileSync(customFontPath);

        const backgroundPath = path.resolve(__dirname, '../../images/rankCardBackground.png');

        const rank = new canvacord.RankCardBuilder()
            .setAvatar(targetUserObject.user.displayAvatarURL({ size: 256 }))
            .setRank(currentRank)
            .setLevel(fetchedLevel.level)
            .setCurrentXP(fetchedLevel.xp)
            .setRequiredXP(calculateLevelXp(fetchedLevel.level))
            .setStatus(targetUserObject.presence?.status || "offline")
            .setUsername(targetUserObject.user.username)
            .setDisplayName(targetUserObject.displayName)
            .setBackground(backgroundPath)
            .setOverlay(backgroundPath)
            .setTextStyles({
                level: "LEVEL:",
                xp: "EXP:",
                rank: "RANK:",
            })
            .setStyles({
                username: {
                    name: {
                        style: {
                            fontSize: '38px',
                            position: 'relative',
                            top: '23px',
                        }
                    },
                    handle: {
                        style: {
                            fontSize: '30px',
                            top: '12px',
                        }
                    },
                },
                statistics: {
                    level: {
                        text: {
                            style: {
                                fontSize: '28px',
                            }
                        }
                    },
                    xp: {
                        text: {
                            style: {
                                fontSize: '28px',
                            }
                        }
                    },
                    rank: {
                        text: {
                            style: {
                                fontSize: '28px',
                            }
                        }
                    },
                }
            })

        const data = await rank.build({ format: 'png' });
        const attachment = new AttachmentBuilder(data);
        interaction.editReply({ files: [attachment] });
    },

    name: 'level',
    description: "Displays your/someone else's level.",
    options: [
        {
            name: 'target-user',
            description: 'The user whose level you want to display.',
            type: ApplicationCommandOptionType.Mentionable,
        },
    ],
};