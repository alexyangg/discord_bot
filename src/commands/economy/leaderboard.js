const { Client, Interaction, AttachmentBuilder, GuildMember } = require("discord.js");
const { Font, LeaderboardBuilder } = require('canvacord');
const Level = require("../../models/Level");
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

        const customFontPath = path.resolve(__dirname, '../../fonts/LeagueSpartan-Bold.ttf');
        Font.fromFileSync(customFontPath);

        const backgroundPath = path.resolve(__dirname, '../../images/leaderboardBackground.png');
        const transparentImage = path.resolve(__dirname, '../../images/transparent.png');

        const userGuildName = interaction.member.guild.name;
        const guildImage = interaction.member.guild.iconURL({ extension: 'png', size: 256 }) || transparentImage;
        const guildNumMembers = interaction.guild.memberCount

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
        const userData = await Promise.all(topUsers.map(async (user, index) => {
            const guildMember = await interaction.guild.members.fetch(user.userId);
            return {
                avatar: guildMember.user.displayAvatarURL({ extension: 'png', forceStatic: true }),
                username: guildMember.user.username,
                displayName: guildMember.displayName,
                level: user.level,
                xp: user.xp,
                rank: index + 1,
            };
        }));

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
    },

    name: 'leaderboard',
    description: "View the top users with the highest level.",

};
