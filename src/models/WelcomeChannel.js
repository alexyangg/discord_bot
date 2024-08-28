const { Schema, model } = require('mongoose');

const welcomeChannelSchema = new Schema(
    {
        guildId: {
            type: String,
            required: true,
        },
        channelId: {
            type: String,
            required: true,
            unique: true,
        },
        customMessage: {
            type: String,
            default: null,
        },
    },
    { timeStamps: true }
);

module.exports = model('WelcomeChannel', welcomeChannelSchema);