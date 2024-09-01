const { Client, Interaction, EmbedBuilder } = require('discord.js');


module.exports = {
    name: 'help',
    description: 'Displays information on how to configure the bot and report issues.',

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const embed = new EmbedBuilder()
            .setTitle('Bot Help')
            .setColor('#ffffff')
            .setDescription('Here is some helpful information to configure the bot and report issues:')
            .addFields(
                { name: 'FAQ', value: `Q: Why's the bot not assigning roles when new members join the server?\nA: Make sure that the bot has the necessary permissions and the Komorebi bot role is above the role you want to assign.\n
                    Q: I can't ban/kick/timeout a user.\nA: Ensure that both you and the bot have enough permissions.`
                    
                },
                { name: 'View All Commands', value: 'Use `/commands` to view all my available commands.' },
                { name: 'View Server Settings', value: 'Use `/settings` to view server settings.' },
                { name: 'Invite Link', value: 'Use `/invite` to invite me to your server.' },
                { name: 'Enable/Disable Leveling Messages', value: 'Use `/configure level-messages` to enable or disable level-up messages.' },
                { name: 'Configure Welcome Message', value: 'Use `/configure welcome` to set a custom welcome message.' },
                { name: 'Configure Auto Role', value: 'Use `/configure autorole` to assign a role automatically to new members.' },
                { name: 'Edit XP Settings', value: 'Use `/configure xp-settings` to adjust experience points settings for leveling.' },
                { name: 'Report Bugs / Request Features', value: '[Click here to report issues via Google Form](https://docs.google.com/forms/d/1TtmlU1O7eaJETiMRXzKqErCL3WBn2rRtJIaMOQqtpDs/edit)' }
            )
            //.setFooter({ text: 'If you need further assistance, feel free to reach out!' });

        interaction.reply({ embeds: [embed], ephemeral: true });
    },
};