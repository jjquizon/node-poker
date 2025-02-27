const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    tableId: { type: String, required: true },
    players: [{ username: String, chips: Number }],
    communityCards: [{ suit: String, value: String }],
    pot: { type: Number, default: 0 },
    stage: { type: String, default: "pre-flop" },
    winner: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Game", gameSchema);