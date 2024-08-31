const { Client, Interaction, EmbedBuilder } = require('discord.js');
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
        const rewardAmount = 250;
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
                // funny
                `On your way to work you slipped on a banana peel... but found **${rewardAmount} coins** underneath it!`,
                `You tried to sell lemonade but drank most of it yourself. Still made a profit of **${rewardAmount} coins**!`,
                `You accidentally delivered pizzas to the wrong house. They still tipped you **${rewardAmount} coins**!`,
                `You rescued a cat from a tree and earned **${rewardAmount} coins**!`,

                // serious
                `You walked some dogs and earned **${rewardAmount} coins**!`,
                `You ran errands for a local shop and earned **${rewardAmount} coins**!`,
                `You mowed your neighbour's lawn and earned **${rewardAmount} coins**!`,
                `You organized a community cleanup and found **${rewardAmount} coins**!`,

                // double rewards
                `You found a lost wallet and returned it. The owner rewarded you generously with **${rewardAmount * 2} coins**!`,
                `You fixed a broken computer. The client was impressed and paid you **${rewardAmount * 2} coins**!`,
                `You discovered a rare collectible while cleaning your attic and sold it for **${rewardAmount * 2} coins**!`,
                `You cleaned a supercar. The owner was astonished at how spotless it was and paid you **${rewardAmount * 2} coins**!`
            ];

            const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];

            user.balance += 250;
            user.lastWork = timeNow;
            await user.save();

            embed.setTitle('Work Completed!')
                .setDescription(`${randomMessage}\n\nYour new balance is **${user.balance} coins**.`);

            interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.log(`Error in /work: ${error}`);
            interaction.editReply('There was an error processing your work command. Please try again later.');
        }
    },
};