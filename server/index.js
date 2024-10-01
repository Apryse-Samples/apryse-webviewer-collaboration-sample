const { WebSocket, WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
        }
    });
    });
});


console.log('WebSocket server is running on ws://localhost:8080');