module.exports = {
    name: 'invite',
    description: "Invite me to your server!",

    callback: async (client, interaction) => {
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=859496216256970762&permissions=8&integration_type=0&scope=bot+applications.commands`;

        await interaction.reply({
            content: `Here is my [invite link](${inviteUrl})!`,
            ephemeral: true
        });
    },
};