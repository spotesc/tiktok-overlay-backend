const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 10000;
const tiktokUsername = 'spotesc'; // Replace with your TikTok username

// Setup TikTok connection
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// Handle WebSocket broadcast
function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// Connect to TikTok Live
tiktokLiveConnection.connect().then(state => {
  console.log(`Connected to TikTok roomId: ${state.roomId}`);
}).catch(err => {
  console.error('TikTok connection failed', err);
});

// Chat event
tiktokLiveConnection.on('chat', (data) => {
  console.log(`${data.uniqueId}: ${data.comment}`);

  broadcast({
    type: 'chat',
    username: data.uniqueId,
    message: data.comment,
    profilePicture: data.profilePictureUrl || ''
  });
});

// Gift event (optional)
tiktokLiveConnection.on('gift', (data) => {
  console.log(`${data.uniqueId} sent ${data.giftName} x${data.repeatCount}`);

  broadcast({
    type: 'gift',
    username: data.uniqueId,
    gift: data.giftName,
    count: data.repeatCount
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
