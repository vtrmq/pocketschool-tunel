const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });
let clientWs = null;
const pendingRequests = {};

wss.on('connection', (ws) => {
  console.log('Cliente conectado exitosamente');
  clientWs = ws;

  ws.on('message', (message) => {
    try {
      const { id, data, headers = {}, status = 200 } = JSON.parse(message);
      console.log('Respuesta recibida del cliente:', { id, status, contentType: headers['Content-Type'] });
      const pendingRequest = pendingRequests[id];
      if (pendingRequest && !pendingRequest.res.writableEnded) {
        const { res } = pendingRequest;
        res.writeHead(status, {
          'Content-Type': headers['Content-Type'] || 'text/html',
          ...headers
        });
        res.end(data);
        delete pendingRequests[id];
      } else {
        console.log('Solicitud ya respondida o no encontrada:', id);
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

server.on('request', (req, res) => {
  console.log('Solicitud HTTP:', req.method, req.url);

  if (!clientWs || clientWs.readyState !== WebSocket.OPEN) {
    if (!res.writableEnded) {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('No hay cliente conectado');
    }
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
    if (!res.writableEnded) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error interno del servidor');
    }
    delete pendingRequests[id];
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
