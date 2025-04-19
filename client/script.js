const socket = new WebSocket('ws://localhost:3000');

let myPlayerId = null;
let myPlayerPos = { x: 100, y: 100 }; // Default start position

function sendMove() {
  if (socket.readyState === WebSocket.OPEN && myPlayerId !== null) {
    socket.send(JSON.stringify({
      type: 'move',
      x: myPlayerPos.x,
      y: myPlayerPos.y
    }));
  }
}


console.log("Client loaded!");

socket.addEventListener('open', function () {
  console.log('✅ Connected to server');
  //socket.send('Hello from client!');
});

socket.addEventListener('message', function (event) {
  try {
    const data = JSON.parse(event.data);

    if (data.type === 'welcome') {
      myPlayerId = data.playerId;
      console.log(`🎉 Welcome! You are Player ${data.playerId}`);
    }
    else if (data.type === 'playerList') {
      players.clear(); // Remove any old data
      for (const p of data.players) {
        players.set(p.id, { x: p.x, y: p.y });
      }
    
      console.log('👥 Player list updated:', Array.from(players.entries()));
    }
    else if (data.type === 'playerJoined') {
      const p = data.player;
      players.set(p.id, { x: p.x, y: p.y });
      console.log(`➕ Player ${p.id} joined at (${p.x}, ${p.y})`);
    }
    else if (data.type === 'playerLeft') {
      players.delete(data.id);
      console.log(`👋 Player ${data.id} left the game`);
    }
    else if (data.type === 'playerMoved') {
      if (data.id !== myPlayerId) {
        players.set(data.id, { x: data.x, y: data.y });
        // Optional: console.log(`↔ Player ${data.id} moved to (${data.x}, ${data.y})`);
      }
    }
    else if (data.type === 'bombPlaced') {
      bombs.push({ x: data.x, y: data.y });
      console.log(`💣 Bomb placed at (${data.x}, ${data.y})`);
    }          
    else {
      console.log('📨 Unknown message type:', data);
    }
    
  } catch (err) {
    // Fallback for plain text messages (like "Server received: Hello from client!")
    console.log('📨 Server message:', event.data);
  }

  
});

socket.addEventListener('error', function (event) {
  console.error('❌ WebSocket error:', event);
});

socket.addEventListener('close', function (event) {
  console.warn('⚠️ WebSocket closed:', event);
});

// ✅ 2. Canvas + game setup (add this below the WebSocket code above)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerSize = 40;
const players = new Map();
const bombs = []; // Each bomb is { x, y }


// ✅ 3. Drawing loop
function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (myPlayerId !== null) {
    players.set(myPlayerId, { x: myPlayerPos.x, y: myPlayerPos.y });
  }
  
  for (const [id, pos] of players) {
    ctx.fillStyle = (id === myPlayerId) ? 'blue' : 'red';
    ctx.fillRect(pos.x, pos.y, playerSize, playerSize);
  
    // Draw ID above the player
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`P${id}`, pos.x + playerSize / 2, pos.y - 5);
  }  
  // Draw bombs
  for (const bomb of bombs) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bomb.x + playerSize / 2, bomb.y + playerSize / 2, playerSize / 4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  requestAnimationFrame(draw);
}

draw();

document.addEventListener('keydown', (event) => {
  const speed = 5;

  if (event.key === 'ArrowUp') {
    myPlayerPos.y -= speed;
  } else if (event.key === 'ArrowDown') {
    myPlayerPos.y += speed;
  } else if (event.key === 'ArrowLeft') {
    myPlayerPos.x -= speed;
  } else if (event.key === 'ArrowRight') {
    myPlayerPos.x += speed;
  }else if (event.code === 'Space') {
    if (socket.readyState === WebSocket.OPEN && myPlayerId !== null) {
      socket.send(JSON.stringify({
        type: 'placeBomb',
        x: myPlayerPos.x,
        y: myPlayerPos.y
      }));
    }
  }  

  sendMove(); // ✅ Send new position to server

});
