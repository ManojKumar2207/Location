const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

const clients = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  const clientId = Math.random().toString(36).substring(7); 
  clients.set(ws, { id: clientId, location: null });
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket server', clientId }));
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);

      if (data.type === 'location') {
        const clientData = clients.get(ws);
        console.log('Updating location for client:', clientData.id);
        clientData.location = data.location;
        broadcastLocations();
      }
    } catch (error) {
      console.error('Error parsing message:', error.message, error.stack);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
    broadcastLocations();
  });
});


function broadcastLocations() {
  const locations = Array.from(clients.values()).map((client) => ({
    clientId: client.id,
    location: client.location,
  }));

  console.log('Broadcasting locations:', locations);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'locations', locations }));
    }
  });
}
