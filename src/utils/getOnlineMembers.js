const { Client, GatewayIntentBits } = require('discord.js');

module.exports = {

    callback: async (client, guildId) => {
        try {
            const guild = await client.guilds.fetch(guildId);
            console.log(guild);

            if (!guild) {
                return;
            }

            await guild.members.fetch();

            const onlineMembers = guild.members.cache.filter(member => 
                member.presence?.status === 'online' ||
                member.presence?.status === 'idle' ||
                member.presence?.status === 'dnd'
            );

            return onlineMembers.size;

        } catch (error) {
            console.log(`Error fetching online members: ${error}`);
        }
    }
};