require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', (c) => {
    console.log(`${c.user.username} is online.`);
});

// checks user command and executes accordingly
client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (interaction.commandName === 'hey') {
        interaction.reply('hey');
    }


})

client.on('message', (message) => {
    let args = message.content.slice(prefix.length).split(' ');
    let cmd = args.shift().toLowerCase();
})



client.login(process.env.TOKEN);
