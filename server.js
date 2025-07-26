import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { LiveClient } from 'tiktok-live-connector';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 10000;
const TIKTOK_USERNAME = 'spotesc';  // Change to your TikTok username

const tiktokLiveClient = new LiveClient(TIKTOK_USERNAME);

tiktokLiveClient.connect().then(() => {
  console.log(`Connected to roomId: ${tiktokLiveClient.roomId}`);
}).catch(console.error);

function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

tiktokLiveClient.on('chat', (chat) => {
  broadcast({
    type: 'chat',
    uniqueId: chat.uniqueId,
    comment: chat.comment
  });
});

tiktokLiveClient.on('gift', (gift) => {
  broadcast({
    type: 'gift',
    uniqueId: gift.uniqueId,
    giftName: gift.giftName,
    repeatCount: gift.repeatCount
  });
});

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
