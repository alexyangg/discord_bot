const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const path = require('path');
const User = require(path.resolve(__dirname, '../../models/User'));

module.exports = {
    name: 'balance',
    description: "View your or someone else's balance",
    options: [
        {
            name: 'user',
            description: 'The user whose balance you want to view.',
            type: ApplicationCommandOptionType.User,
        }
    ],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply({
                content: "You can only run this command inside a server.",
                ephemeral: true,
            });
            return;
        }

        const targetUserId = interaction.options.get('user')?.value || interaction.member.id;

        await interaction.deferReply();

        const user = await User.findOne({
            userId: targetUserId,
            //guildId: interaction.guild.id
        });

        let embed = new EmbedBuilder()
            .setColor('#ffffff')

        if (!user) {
            embed.setDescription(`<@${targetUserId}> doesn't have a profile yet.`);
            interaction.editReply({ embeds: [embed] });
            return;
        }

        // check if targetUser is the one calling the command
        if (targetUserId === interaction.member.id) {
            embed.setDescription(`Your balance is **${user.balance}**.`);
        } else {
            embed.setDescription(`<@${targetUserId}>'s balance is **${user.balance}**.`);
        }

        interaction.editReply({ embeds: [embed] });

    },
};