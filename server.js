import express from 'express';
import { WebSocketServer } from 'ws';
import { WebcastPushConnection } from 'tiktok-live-connector';

const PORT = process.env.PORT || 10000;
const TIKTOK_USERNAME = 'spotesc'; // <-- your TikTok username

const app = express();

app.get('/', (req, res) => {
  res.send('TikTok Overlay Backend running');
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Create connection instance
const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

// Connect to the stream
tiktokLiveConnection.connect().then(state => {
  console.log(`Connected to roomId: ${state.roomId}`);
}).catch(err => {
  console.error('Failed to connect:', err);
});

// Handle chat events
tiktokLiveConnection.on('chat', data => {
  console.log(`[Chat] ${data.uniqueId}: ${data.comment}`);

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'chat',
        user: data.uniqueId,
        message: data.comment
      }));
    }
  });
});
