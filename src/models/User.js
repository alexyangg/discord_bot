const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
//   guildId: {         Allow data to be accessed globally
//     type: String,
//     required: true,
//   },
  balance: {
    type: Number,
    default: 0,
  },
  lastDaily: {
    type: Date,
    required: true,
    default: null,
  },
  lastWork: {
    type: Date,
    required: true,
    default: null,
  },
});

module.exports = model('User', userSchema);