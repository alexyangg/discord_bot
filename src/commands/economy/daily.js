const { Client, Interaction, EmbedBuilder } = require('discord.js');
const path = require('path');
const User = require(path.resolve(__dirname, '../../models/User'));

const dailyAmount = 1000;

module.exports = {
    name: 'daily',
    description: 'Collect your dailies!',
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

        try {
            await interaction.deferReply();

            const query = {
                userId: interaction.member.id,
                //guildId: interaction.guild.id, // command is not guild-specific
            };

            let user = await User.findOne(query);
            let embed = new EmbedBuilder()
                .setColor('#ffffff');

            if (user) {
                const lastDailyDate = user.lastDaily.toDateString();
                const currentDate = new Date().toDateString();

                if (lastDailyDate === currentDate) {
                    embed.setDescription("You have already collected your dailies today. Come back tomorrow!");
                    interaction.editReply({ embeds: [embed] });
                    return;
                }
                user.lastDaily = new Date();
            } else {
                user = new User({
                    ...query, // same as userId and guildId fields
                    lastDaily: new Date(),
                });
            }

            user.balance += dailyAmount;
            await user.save(); // save to database

            embed.setDescription(`${dailyAmount} was added to your balance. Your new balance is ${user.balance}.`);
            interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log(`Error with /daily: ${error}`);
        }
    }

}