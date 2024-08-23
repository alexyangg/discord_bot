const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder, EmbedBuilder, } = require("discord.js");
const { Font, LeaderboardBuilder } = require('canvacord');
const Level = require("../../models/Level");
const path = require('path');
const getOnlineMembers = require("../../utils/getOnlineMembers");

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

        const isEmbed = interaction.options.get('embed')?.value;

        const customFontPath = path.resolve(__dirname, '../../fonts/LeagueSpartan-Bold.ttf');
        Font.fromFileSync(customFontPath);

        const backgroundPath = path.resolve(__dirname, '../../images/leaderboardBackground.png');
        const transparentImage = path.resolve(__dirname, '../../images/transparent.png');

        const userGuildName = interaction.member.guild.name;
        const guildImage = interaction.member.guild.iconURL({ extension: 'png', size: 256 }) || transparentImage;
        const guildNumMembers = interaction.guild.memberCount
        const onlineMembers = await getOnlineMembers.callback(client, interaction.guild);

        const topUsers = await Level.find({ guildId: interaction.guild.id })
            .select('-_id userId level xp')
            .limit(10)
            .catch((error) => console.log(error));

        topUsers.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            } else {
                return b.level - a.level;
            }
        });

        // loop through the top users and fetch their data
        // returns an array of arrays
        const userData = await Promise.all(topUsers.map(async (user, index) => {
            const guildMember = await interaction.guild.members.fetch(user.userId);
            return {
                avatar: guildMember.user.displayAvatarURL({ extension: 'png', forceStatic: true }),
                username: guildMember.user.username,
                displayName: guildMember.displayName,
                level: user.level,
                xp: user.xp,
                rank: index + 1,
                id: user.userId,
            };
        }));

        if (isEmbed) {
            // text-based leaderboard
            let lbEmbed = new EmbedBuilder()
                .setTitle(`**${userGuildName} Level Leaderboard**`)
                .setColor('#ffffff')
                .setFooter({ text: `${guildNumMembers} members | ${onlineMembers} online` });

            let desc = "";

            userData.forEach(user => {
                let medal = "";
                switch (user.rank) {
                    case 1:
                        medal = "🥇"; // gold medal for 1st place
                        break;
                    case 2:
                        medal = "🥈"; // silver medal for 2nd place
                        break;
                    case 3:
                        medal = "🥉"; // bronze medal for 3rd place
                        break;
                    default:
                        medal = "🔹"; // diamond icon for others
                }

                desc += `${medal} <@${user.id}> Level: ${user.level} | XP: ${user.xp}\n`;
            });

            if (desc !== "") {
                lbEmbed.setDescription(desc);
                interaction.editReply({ embeds: [lbEmbed] });
            } else {
                interaction.editReply("I couldn't display the leaderboard.");
                return;
            }
        } else {
            // image-based leaderboard
            const lb = new LeaderboardBuilder()
                .setHeader({
                    title: userGuildName,
                    image: guildImage,
                    subtitle: `${guildNumMembers} members`,
                })
                .setPlayers(userData)
                .setBackground(backgroundPath)
                .setVariant('default');

            const image = await lb.build({ format: 'png' });
            const attachment = new AttachmentBuilder(image);
            interaction.editReply({ files: [attachment] });
        }
    },

    name: 'leaderboard',
    description: "View the top users with the highest level.",
    options: [
        {
            name: 'embed',
            description: 'Displays the leaderboard as a text embed instead of an image.',
            type: ApplicationCommandOptionType.Boolean,
        }
    ]

};
