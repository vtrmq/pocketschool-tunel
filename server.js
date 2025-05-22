const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Solicitud HTTP:', req.url);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Use WebSocket to connect a client');
});

const wss = new WebSocket.Server({ server });
let clientWs = null;

wss.on('connection', (ws) => {
  console.log('Cliente conectado exitosamente');
  clientWs = ws;

  ws.on('message', (message) => {
    try {
      const { id, data } = JSON.parse(message);
      const pendingRequest = pendingRequests[id];
      if (pendingRequest) {
        const { res } = pendingRequest;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
        delete pendingRequests[id];
      }
    } catch (err) {
      console.error('Error procesando mensaje:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
    clientWs = null;
  });

  ws.on('error', (err) => {
    console.error('Error en WebSocket:', err.message);
  });
});

const pendingRequests = {};

server.on('request', (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Use WebSocket to connect a client');
    return;
  }

  if (!clientWs || clientWs.readyState !== WebSocket.OPEN) {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('No hay cliente conectado');
    return;
  }

  const id = Math.random().toString(36).substring(2);
  pendingRequests[id] = { res };

  try {
    clientWs.send(JSON.stringify({
      id,
      method: req.method,
      url: req.url,
      headers: req.headers
    }));

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      if (body && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ id, body }));
      }
    });
  } catch (err) {
    console.error('Error enviando solicitud:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error interno del servidor');
    delete pendingRequests[id];
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
