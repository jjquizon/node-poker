require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const User = require('./models/User');
const Game = require('./models/Game');
const pokerGame = require('./pokerGame');
const http = require('http');
const { Server } = require('socket.io');
const app = express();

dotenv.config();
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow frontend connection
        methods: ['GET', 'POST'],
        transpors: ['websocket']
    }
});

// Store in Active memory; TODO: Store in DB
const gameTables = {};
const activeGames = {};

const PORT = process.env.PORT || 3001;

let players = {};

app.get('/', (req, res) => {
    res.send('Poker Game Backend is Running');
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create or get a user
    socket.on("register", async ({ tableId, playerName }) => {
        console.log(`Registering ${playerName} to table ${tableId}`);
        if (!gameTables[tableId]) {
            gameTables[tableId] = new Game({ tableId });
        }
        
        gameTables[tableId].players.push({ userName: playerName, chips: 1000 });
        await gameTables[tableId].save();
        socket.join(tableId);
        io.to(tableId).emit('table_update', `${playerName} joined the table`);
    });

    // Join Table
    socket.on('join_table', (username) => {
        if (gameState.players.length < 8) {
            players[socket.id] = username;
            gameState.players.push({ id: socket.id, username: username, chips: 1000, folded: false });
            console.log(`${username} joined the table`);
            io.emit('update_game', gameState);
        } else {
            socket.emit('table_full', 'Table is full');
        }
    });

    // Start Game
    socket.on('start_game', async (tableId) => {
        if (gameTables[tableId]) {
            gameTables[tableId].communityCards = [];
            gameTables[tableId].stage = "pre-flop";
            await gameTables[tableId].save();

            io.to(tableId).emit('game_started', {
                message: 'Game Started',
                players: gameTables[tableId].players,
            });
        }
    });

    socket.on("player_action", ({ gameId, playerId, action, amount }) => {
        let game = activeGames[gameId];
        if (!game) return socket.emit("error", "Game not found");

        let result = game.playerAction(playerId, action, amount);
        io.to(gameId).emit("game_update", game);
    });

    // Save Hand History
    socket.on("end_game", async ({ tableId, winner }) => {
        if (gameTable[tableId]) {
            const game = gameTables[tableId];
            const handHistory = new HandHistory({
                gameId: game._id,
                players: game.players,
                communityCards: game.communityCards,
                winner: winner,
                pot: game.pot
            });

            await handHistory.save();
            io.to(tableId).emit('game_ended', `Winner: ${winner}`);
        }
    });

    // User Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

function checkToStartGame() {
    for (const tableId in gameTables) {
        if (gameTables[tableId].players.length >= 2 && activeGames[tableId] === undefined) {
            io.to(tableId).emit('game_ready', 'Game is ready to start');
            game = new pokerGame(tableId, gameTables[tableId].players);
            activeGames[tableId] = true;
        }
    }
    
}

setInterval(checkToStartGame, 20000);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));