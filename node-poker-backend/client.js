const { io } = require("socket.io-client");

// const socket = io("ws://localhost:4000"); // Use ws:// or http://
const socket = io("ws://localhost:3001", { transports: ["websocket"] });


socket.on("connect", () => {
    console.log("✅ Connected to the server!");

    socket.emit("join_table", `Player ${Math.floor(Math.random() * 100)}`);
    
});

socket.on("message", (data) => {
    console.log("Received:", data);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected! Attempting to reconnect...");
});
socket.on("connect_error", (err) => {
    console.log("⚠️ Connection error:", err.message);
});

console.log("Client Running");