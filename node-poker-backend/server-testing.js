// const http = require('http');
// const { Server } = require('socket.io');

// const server = http.createServer();
// const io = new Server(server, {
//     // cors: {
//     //     origin: '*',
//     //     methods: ['GET', 'POST']
//     // }
// });

// io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     socket.on('message', (data) => {
//         console.log('Received:', data);
//         socket.send('Echo: ' + data);
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//     });
// });

// server.listen(4000, () => {
//     console.log('WebSocket server running on port 4000');
// });
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, { 
  cors: { origin: '*' }, 
  transports: ['websocket']  // Force WebSocket transport
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Received:', msg);
    socket.emit('message', 'Echo: ' + msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('WebSocket server running on port 4000');
});