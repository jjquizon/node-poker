require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow frontend connection
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3001;

let players = {};
let gameState ={
    players: [],
    pot: 0,
    currentBet: 0,
    dealer: 0,
    currentTurn: 0,
    gameStarted: false
}

app.get('/', (req, res) => {
    res.send('Poker Game Backend is Running');
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_table', (username) => {
        if (gameState.players.length < 6) {
            players[socket.id] = username;
            gameState.players.push({ id: socket.id, username: username, chips: 1000, folded: false });
            console.log(`${username} joined the table`);
            io.emit('update_game', gameState);
        } else {
            socket.emit('table_full', 'Table is full');
        }
    });

    socket.on('place_bet', (amount) => {
        const player = gameState.players.find(p => p.id === socket.id);
        if (player && amount <= player.choips) {
            player.chips -= amount;
            gameState.pot += amount;
            gameState.currentBet = amount;
            console.log(`${player.username} bet ${amount}`);
            io.emit('update_game', gameState);
        } else {
            socket.emit('bet_error', 'Invalid Bet');
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        gameState.players = gameState.players.filter(p => p.id !== socket.id);
        delete players[socket.id];
        io.emit('update_game', gameState);
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));