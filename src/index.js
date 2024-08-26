require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');
const path = require('path');
const eventHandler = require(path.resolve(__dirname, './handlers/eventHandler'));
const keepAlive = require(path.resolve(__dirname, './keepAlive.js'));
const mongoose = require('mongoose');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.MessageContent,
    ],
});

(async () => {
    try {
        keepAlive();

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB.");
    
        eventHandler(client);
        
        client.login(process.env.TOKEN);
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();
