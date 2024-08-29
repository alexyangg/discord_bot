const { Schema, model } = require('mongoose');

const guildSettingsSchema = new Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    levelUpMessageEnabled: {
        type: Boolean,
        default: true,
    },
    minXpAmount: {
        type: Number,
        default: 5,
    },
    maxXpAmount: {
        type: Number,
        default: 15,
    },
    xpCooldown: {
        type: Number,
        default: 5000,
    },
});

module.exports = model('GuildSettings', guildSettingsSchema);