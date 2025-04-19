const WebSocket = require('ws');

// A map of connected players
const players = new Map(); // playerId -> { ws, x, y }

let nextPlayerId = 1; // Simple counter to assign unique IDs

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
  const playerId = nextPlayerId++;

  const randomX = Math.floor(Math.random() * 600) + 50;
  const randomY = Math.floor(Math.random() * 400) + 50;

  players.set(playerId, {
    ws: ws,
    x: randomX,
    y: randomY
  });

  console.log(`Player ${playerId} connected.`);

  // Send the new player their ID
  ws.send(JSON.stringify({ type: 'welcome', playerId }));

  const allPlayers = Array.from(players.entries()).map(([id, data]) => {
    return {
      id: id,
      x: data.x,
      y: data.y
    };
  });

  ws.send(JSON.stringify({
    type: 'playerList',
    players: allPlayers
  }));
  
  // Notify all other players that a new player has joined
  for (const [id, other] of players.entries()) {
    if (id !== playerId) {
      other.ws.send(JSON.stringify({
        type: 'playerJoined',
        player: {
          id: playerId,
          x: randomX,
          y: randomY
        }
      }));
    }
  }

  ws.on('message', function incoming(message) {
    const msgString = message.toString();
    let data;
  
    try {
      data = JSON.parse(msgString);
    } catch (err) {
      console.log(`⚠️ Could not parse message from Player ${playerId}:`, msgString);
      return;
    }
  
    if (data.type === 'move') {
      const player = players.get(playerId);
      if (!player) return;
  
      player.x = data.x;
      player.y = data.y;
  
      for (const [id, other] of players.entries()) {
        if (id !== playerId) {
          other.ws.send(JSON.stringify({
            type: 'playerMoved',
            id: playerId,
            x: data.x,
            y: data.y
          }));
        }
      }
    }
  
    else if (data.type === 'placeBomb') {
      console.log(`💣 Player ${playerId} placed a bomb at (${data.x}, ${data.y})`);
  
      for (const [id, other] of players.entries()) {
        other.ws.send(JSON.stringify({
          type: 'bombPlaced',
          playerId: playerId,
          x: data.x,
          y: data.y
        }));
      }
    }
  
    // Optional: add more else if blocks later
  });
  

  ws.send('Welcome to Bomberman Server!');

  ws.on('close', () => {
    players.delete(playerId);
    console.log(`❌ Player ${playerId} disconnected.`);
  
    // Notify remaining players
    for (const [id, other] of players.entries()) {
      other.ws.send(JSON.stringify({
        type: 'playerLeft',
        id: playerId
      }));
    }
  });
  
});

console.log("WebSocket server is running on ws://localhost:3000");
