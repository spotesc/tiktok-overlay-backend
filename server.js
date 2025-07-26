import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import TikTokLiveConnector from 'tiktok-live-connector';

const { LiveClient } = TikTokLiveConnector;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 10000;
const TIKTOK_USERNAME = 'spotesc';  // Replace with your username

const tiktokLiveClient = new LiveClient(TIKTOK_USERNAME);

tiktokLiveClient.connect()
  .then(() => {
    console.log(`Connected to roomId: ${tiktokLiveClient.roomId}`);
  })
  .catch(console.error);

// Broadcast function (only one)
function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// Handle chat
tiktokLiveClient.on('chat', (chat) => {
  console.log('Chat:', chat);
  broadcast({
    type: 'chat',
    uniqueId: chat.uniqueId || chat.userId || 'UnknownUser',
    comment: chat.comment || '',
    profilePictureUrl: chat.profilePictureUrl || '',
  });
});

// Handle gift
tiktokLiveClient.on('gift', (gift) => {
  console.log('Gift:', gift);
  broadcast({
    type: 'gift',
    uniqueId: gift.uniqueId || gift.userId || 'UnknownUser',
    giftName: gift.giftName || 'Gift',
    repeatCount: gift.repeatCount || 1,
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
