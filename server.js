const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Solicitud HTTP:', req.url);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Use WebSocket to connect a client');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado exitosamente');
  ws.send('Conexión WebSocket establecida');

  ws.on('message', (msg) => {
    console.log('Mensaje recibido:', msg.toString());
    ws.send(`Eco: ${msg}`);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });

  ws.on('error', (err) => {
    console.error('Error en WebSocket:', err.message);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
