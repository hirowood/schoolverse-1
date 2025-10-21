// Simple Socket.io realtime server for MVP presence/position sync
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const PORT = process.env.RT_PORT || 3001;
const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory state: socket.id -> player
const players = new Map();

io.on('connection', (socket) => {
  // Client should emit 'presence:join' with { userId, displayName }
  socket.on('presence:join', (payload) => {
    const { userId, displayName } = payload || {};
    if (!userId) return;
    const player = {
      socketId: socket.id,
      userId,
      displayName: displayName || 'Player',
      x: 800,
      y: 600,
    };
    players.set(socket.id, player);

    // Send full state to the new client
    socket.emit('presence:state', Array.from(players.values()));
    // Notify others
    socket.broadcast.emit('presence:joined', player);
  });

  socket.on('space:position:update', (pos) => {
    const p = players.get(socket.id);
    if (!p) return;
    if (typeof pos?.x === 'number' && typeof pos?.y === 'number') {
      p.x = pos.x; p.y = pos.y;
      socket.broadcast.emit('space:position:update', { userId: p.userId, x: p.x, y: p.y });
    }
  });

  socket.on('disconnect', () => {
    const p = players.get(socket.id);
    if (p) {
      players.delete(socket.id);
      socket.broadcast.emit('presence:left', { userId: p.userId });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Realtime server listening on :${PORT}`);
});

