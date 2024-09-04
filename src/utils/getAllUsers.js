module.exports = async (client) => {
    try {
        // get the total number of users across all servers that the bot is a part of, using an accumulator
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        return totalUsers;
    } catch (error) {
        console.log(`Error fetching all users: ${error}`);
        return 0;
    }

};