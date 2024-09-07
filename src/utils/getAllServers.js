module.exports = async (client) => {
    try {
        const totalServers = client.guilds.cache.size;
        return totalServers;
    } catch (error) {
        console.log(`Error fetching all users: ${error}`);
        return 0;
    }

};