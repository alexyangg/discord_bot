const { Client, CommandInteraction, ApplicationCommandOptionType, Application } = require('discord.js');

module.exports = {
    name: '8ball',
    description: 'Ask the magic 8-ball a question!',
    options: [
        {
            name: 'question',
            description: 'The question you want to ask the 8-ball',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    callback: async (client, interaction) => {
        const question = interaction.options.getString('question');
        // 20 possible 8-ball responses; 10 positive, 5 vague, 5 negative
        const responses = [
            'It is certain.',
            'It is decidedly so.',
            'Without a doubt.',
            'Yes - definitely.',
            'You may rely on it.',
            'As I see it, yes.',
            'Most likely.',
            'Outlook good.',
            'Yes.',
            'Signs point to yes.',
            'Reply hazy, try again.',
            'Ask again later.',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            "Don't count on it.",
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Very doubtful.',
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];

        await interaction.reply(`> ${question}\n🎱 **${response}**`);
    }
}