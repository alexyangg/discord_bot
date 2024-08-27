const { Schema, model } = require('mongoose');

const guildSettingsSchema = new Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    levelUpMessageEnabled: {
        type: Boolean,
        required: true,
    },
});

module.exports = model('GuildSettings', guildSettingsSchema);