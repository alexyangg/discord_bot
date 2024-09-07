const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const config = require('../../../config.json');
const devIds = config.devs;
const getOnlineMembers = require("../../utils/getOnlineMembers");
const getAllUsers = require('../../utils/getAllUsers');
const getAllServers = require('../../utils/getAllServers');

module.exports = {
    name: 'membercount',
    description: "Displays the number of members in this server.",
    options: [
        {
            name: 'global',
            description: '(Dev-only) Displays the number of total users using the bot and servers the bot is in.',
            type: ApplicationCommandOptionType.Boolean,
        }
    ],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const currentTime = new Date().toLocaleTimeString();
        const isGlobal = interaction.options.get('global')?.value;
        const embed = new EmbedBuilder()
            .setColor('#ffffff');

        if (!isGlobal) {
            const memberCount = interaction.guild.memberCount;
            const onlineMembers = await getOnlineMembers.callback(client, interaction.guild);
            const guildName = interaction.member.guild.name;

            embed.setTitle(`**${guildName} Total Members**`);
            embed.setDescription(`${memberCount}`);
            embed.setFooter({ text: `Online members: ${onlineMembers}` });
            interaction.reply({ embeds: [embed] });

        } else {
            if (!devIds.includes(interaction.user.id)) {
                embed.setDescription(`You must be a developer to use the global option.`);
                interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const globalMemberCount = await getAllUsers(client);
                const globalServerCount = await getAllServers(client);

                embed.setDescription(`Total users using bot: ${globalMemberCount}\nTotal servers bot is in: ${globalServerCount}`);
                embed.setFooter({ text: `Current time: ${currentTime}` });
                interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};