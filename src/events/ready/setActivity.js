const { ActivityType } = require("discord.js");
const getAllUsers = require("../../utils/getAllUsers");
const getAllServers = require("../../utils/getAllServers");

module.exports = async (client) => {
    try {
        const totalUsers = await getAllUsers(client);
        const totalServers = await getAllServers(client);

        client.user.setActivity({ name: "/help | /commands" });
        
        // client.user.setActivity({
        //     name: `${totalUsers} users!`,
        //     type: ActivityType.Watching
        // });

        console.log(`Total users using bot: ${totalUsers}`);
        console.log(`Total servers bot is in: ${totalServers}`);
    } catch (error) {
        console.log(`Error setting bot activity: ${error}`);
    }
}