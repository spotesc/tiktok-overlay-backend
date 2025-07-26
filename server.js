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

// ... your imports and setup

tiktokLiveClient.on('chat', (chat) => {
  console.log('Chat event:', chat);

  broadcast({
    type: 'chat',
    uniqueId: chat.uniqueId || chat.userId || 'UnknownUser',
    comment: chat.comment || chat.message || chat.commentMessage || '',
    profilePictureUrl: chat.profilePictureUrl || '', // optional, if you want to show avatar
  });
});

tiktokLiveClient.on('gift', (gift) => {
  broadcast({
    type: 'gift',
    uniqueId: gift.uniqueId || gift.userId || 'UnknownUser',
    giftName: gift.giftName || 'Gift',
    repeatCount: gift.repeatCount || 1,
  });
});

// broadcast function sends JSON stringified data to clients
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
