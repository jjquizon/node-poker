const { io } = require("socket.io-client");

// const socket = io("ws://localhost:4000"); // Use ws:// or http://
const socket = io("ws://localhost:3001", { transports: ["websocket"] });

function getRandomNum() {
    return Math.floor(Math.random() * 100);
};

function getRandomName() {
    const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore"];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const num = getRandomNum();
    return `${firstName}-${lastName}-${num}`;
};

socket.on("connect", () => {
    console.log("✅ Connected to the server!");

    console.log("Registering...");
    socket.emit("register", {"tableId": getRandomNum(), "playerName": getRandomName()})
});

socket.onAny((event, ...args) => {
    console.log(event, args);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected! Attempting to reconnect...");
});
socket.on("connect_error", (err) => {
    console.log("⚠️ Connection error:", err.message);
});

console.log("Client Running");