require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

eventHandler(client);

// checks user command and executes accordingly
client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (interaction.commandName === 'hey') {
        interaction.reply('hey');
    }

})

client.login(process.env.TOKEN);
