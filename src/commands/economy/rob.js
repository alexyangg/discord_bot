const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const path = require('path');
const User = require(path.resolve(__dirname, '../../models/User'));
const ms = require('ms');

module.exports = {
    name: 'rob',
    description: "Attempt to rob another user's balance.",
    options: [
        {
            name: 'target-user',
            description: 'The user you want to rob.',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const robberId = interaction.user.id;
        const targetId = interaction.options.getUser('target-user').id;
        const cooldownDuration = 3600000;
        const successRate = 0.5; // 50% success chance
        const penaltyRate = 0.2; // 20% of robber's balance lost if rob fails
        const amountToRob = 0.2; // 20% of target's balance lost if rob succeeds
        const minBalanceToRob = 100; // balance needed for target to be robbed

        const embed = new EmbedBuilder()
            .setColor('#ffffff');

        if (robberId === targetId) {
            embed.setDescription('You cannot rob yourself!');
            interaction.reply({ embeds: [embed] });
            return;
        }

        try {
            await interaction.deferReply();

            let robber = await User.findOne({ userId: robberId });
            let target = await User.findOne({ userId: targetId });

            if (!robber) {
                robber = new User({ userId: robberId, balance: 0, lastRob: new Date(0) });
                await robber.save();
            }

            if (!target) {
                embed.setDescription('The target user has no balance to rob.');
                interaction.editReply({ embeds: [embed] });
                return;
            }

            if (target.balance < minBalanceToRob) {
                embed.setDescription(`The target user must have at least ${minBalanceToRob} currency to be robbed.`);
                interaction.editReply({ embeds: [embed] });
                return;
            }

            const timeNow = new Date();
            const lastRob = robber.lastRob ? new Date(robber.lastRob) : null;

            if (lastRob && timeNow - lastRob < cooldownDuration) {
                const timeRemaining = ms(cooldownDuration - (timeNow - lastRob), { long: true });
                embed.setDescription(`You need to wait ${timeRemaining} before attempting to rob again.`);
                interaction.editReply({ embeds: [embed] });
                return;
            }

            const success = Math.random() < successRate;

            if (success) {
                const stolenAmount = Math.floor(target.balance * amountToRob);
                target.balance -= stolenAmount;
                robber.balance += stolenAmount;
                robber.lastRob = timeNow;

                await target.save();
                await robber.save();

                embed.setTitle('Robbery Successful!')
                    .setDescription(`You successfully robbed ${stolenAmount} currency from ${interaction.options.getUser('target-user').username}!`)
                    .setFooter({ text: `Your new balance is ${robber.balance} currency.` });

                interaction.editReply({ embeds: [embed] });
            } else {
                const penalty = Math.floor(robber.balance * penaltyRate);
                robber.balance -= penalty;
                robber.lastRob = timeNow;

                await robber.save();

                embed.setTitle('Robbery Failed...')
                    .setDescription(`You were caught! You lost ${penalty} currency as a penalty.`)
                    .setFooter({ text: `Your new balance is ${robber.balance} currency.` });

                interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.log(`Error in /rob: ${error}`);
            interaction.editReply('There was an error processing your rob command. Please try again later.');
        }
    },
};