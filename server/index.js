const WebSocket = require('ws');

// A map of connected players
const players = new Map();

let nextPlayerId = 1; // Simple counter to assign unique IDs

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
  const playerId = nextPlayerId++;
  players.set(playerId, ws);

  console.log(`Player ${playerId} connected.`);

  // Send the new player their ID
  ws.send(JSON.stringify({ type: 'welcome', playerId }));

    // Send the list of currently connected player IDs
    const allPlayerIds = Array.from(players.keys());

    ws.send(JSON.stringify({
      type: 'playerList',
      players: allPlayerIds
    }));
  
  ws.on('message', function incoming(message) {
    const msgString = message.toString(); // Convert Buffer to string
    console.log(`Received from Player ${playerId}:`, msgString);
    ws.send(`Server received: ${msgString}`);
  });

  ws.send('Welcome to Bomberman Server!');


});

console.log("WebSocket server is running on ws://localhost:3000");
