const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const path = require('path');
const User = require(path.resolve(__dirname, '../../models/User'));
const ms = require('ms');

module.exports = {
    name: 'work',
    description: "Work to earn some extra balance.",

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const userId = interaction.user.id;
        const cooldownDuration = 3600000;

        try {
            await interaction.deferReply();

            let user = await User.findOne({ userId });

            if (!user) {
                user = new User({ userId });
                await user.save();
            }

            const timeNow = new Date();
            const lastWork = user.lastWork ? new Date(user.lastWork) : null;

            const embed = new EmbedBuilder()
                .setColor('#ffffff');

            if (lastWork && timeNow - lastWork < cooldownDuration) {
                const timeRemaining = ms(cooldownDuration - (timeNow - lastWork), { long: true });
                embed.setDescription(`You need to wait ${timeRemaining} before working again.`);
                interaction.editReply({ embeds: [embed] });
                return;
            }

            const randomMessages = [
                'Rescued a cat from a tree and earned 250 currency!',
                'Helped a friend and got 250 currency!',
                'Did some freelance work and got 250 currency!',
                'Cleaned up the town and earned 250 currency!',
                'Mowed the lawn and received 250 currency!',
            ];

            const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];

            user.balance += 250;
            user.lastWork = timeNow;
            await user.save();

            embed.setTitle('Work Completed!')
                .setDescription(randomMessage)
                .setFooter({ text: `Your new balance is ${user.balance} currency.` });

            interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.log(`Error in /work: ${error}`);
            interaction.editReply('There was an error processing your work command. Please try again later.');
        }
    },
};