import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import cors from 'cors';
import 'express-async-errors';
import connectToDatabase from './middlewares/mongodb.js';

import audioRoutes from './router/audio.routes.js';
import artistRoutes from './router/artist.routes.js';
import albumRoutes from './router/album.routes.js';
import adminRoutes from './router/admin.routes.js';

dotenv.config();
connectToDatabase();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/audio', audioRoutes);
app.use('/api/artist', artistRoutes);
app.use('/api/album', albumRoutes);
app.use('/api/admin', adminRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
let sessions = {};
io.on('connection', socket => {
  socket.on('startSession', () => {
    const sessionId = generateUniqueSessionId();
    sessions[sessionId] = {
      host: socket.id,
      members: [socket.id],
      playback: {
        isPlaying: false,
        songId: null,
        currentTime: 0,
      },
    };
    socket.join(sessionId);
    console.log(`Session started: ${sessionId} by host: ${socket.id}`);
    socket.emit('sessionStarted', {sessionId, isHost: true});
  });

  socket.on('joinSession', sessionId => {
    if (sessions[sessionId]) {
      sessions[sessionId].members.push(socket.id);
      socket.join(sessionId);

      // Ensure the current playback state is fetched correctly
      const playbackState = sessions[sessionId].playback;
      if (playbackState) {
        // Emit the current playback state
        socket.emit('syncPlayback', playbackState);
        console.log(
          `User ${socket.id} joined session ${sessionId}, syncing playback:`,
          playbackState,
        );
      } else {
        console.log(`Playback state not found for session ${sessionId}`);
      }
    } else {
      socket.emit('error', 'Session does not exist');
    }
  });

  socket.on('leaveSession', sessionId => {
    if (sessions[sessionId]) {
      const index = sessions[sessionId].members.indexOf(socket.id);
      if (index > -1) {
        sessions[sessionId].members.splice(index, 1);
        socket.leave(sessionId);
        console.log(`User left session: ${sessionId}`);
        if (
          sessions[sessionId].length === 0 ||
          sessions[sessionId].host === socket.id
        ) {
          delete sessions[sessionId];
        }
      }
    }
  });

  socket.on('play', ({sessionId, songId, currentTime, isPlaying}) => {
    const session = sessions[sessionId];
    if (session && socket.id === session.host) {
      session.playback = {songId, currentTime, isPlaying};
      console.log(
        `Updated playback state for session ${sessionId}:`,
        session.playback,
      );

      io.to(sessionId).emit('syncPlayback', session.playback);
    } else {
      console.log(
        `Failed to update playback: either session ${sessionId} does not exist or socket ${socket.id} is not the host`,
      );
    }
  });

  socket.on('pause', ({sessionId, isPlaying}) => {
    const session = sessions[sessionId];
    if (session && socket.id === session.host) {
      sessions[sessionId].playback.isPlaying = isPlaying;
      io.to(sessionId).emit('syncPlayback', {
        ...sessions[sessionId].playback,
        isPlaying,
      });
    }
  });
});

function generateUniqueSessionId() {
  return Math.random().toString(36).substr(2, 9);
}

const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Serveur NodeJS sur le port ${port}...`));
