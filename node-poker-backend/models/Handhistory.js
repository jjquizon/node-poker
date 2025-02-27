const mongoose = require("mongoose");

const handHistorySchema = new mongoose.Schema({
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    players: [{ username: String, hand: [{ suit: String, value: String }] }],
    communityCards: [{ suit: String, value: String }],
    winner: { type: String, required: true },
    pot: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("HandHistory", handHistorySchema);