console.log("Client loaded!");

const socket = new WebSocket('ws://localhost:3000');

alert("Are we really loading this file?");

socket.addEventListener('open', function () {
  console.log('✅ Connected to server');
  socket.send('Hello from client!');
});

socket.addEventListener('message', function (event) {
  try {
    const data = JSON.parse(event.data);

    if (data.type === 'welcome') {
      console.log(`🎉 Welcome! You are Player ${data.playerId}`);
    } else {
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
