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
    default: null,
  },
  lastWork: {
    type: Date,
    default: null,
  },
  lastRob: {
    type: Date,
    default: null,
  },
  // inventory: [
  //   {
  //     itemName: { type: String, required: true },
  //     quantity: { type: Number, default: 1 },
  //     purchaseDate: { type: Date, default: Date.now },
  //   }
  // ],
  inventory: {
    type: [
      {
        itemName: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        purchaseDate: { type: Date, default: Date.now },
      }
    ],
    default: [],
  },
});

module.exports = model('User', userSchema);