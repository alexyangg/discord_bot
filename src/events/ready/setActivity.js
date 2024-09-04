const { ActivityType } = require("discord.js");
const getAllUsers = require("../../utils/getAllUsers");

module.exports = async (client) => {
    try {
        const totalUsers = await getAllUsers(client);

        client.user.setActivity({ name: "/help | /commands" });
        
        // client.user.setActivity({
        //     name: `${totalUsers} users!`,
        //     type: ActivityType.Watching
        // });

        console.log(`Total users using bot: ${totalUsers}`);
    } catch (error) {
        console.log(`Error setting bot activity: ${error}`);
    }
}