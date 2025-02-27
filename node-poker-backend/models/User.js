const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    chips: { type: Number, default: 1000 },
    gamesPlayed: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", userSchema);