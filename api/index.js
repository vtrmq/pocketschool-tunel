const WebSocket = require('ws');

module.exports = (req, res) => {
  console.log('Solicitud recibida:', {
    url: req.url,
    headers: req.headers,
    upgrade: req.headers.upgrade
  });

  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    console.log('Detectada solicitud WebSocket');

    const wss = new WebSocket.Server({ noServer: true });

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

    if (res.socket.server) {
      console.log('Configurando evento de upgrade');
      res.socket.server.on('upgrade', (request, socket, head) => {
        console.log('Procesando upgrade:', request.url);
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      });
    } else {
      console.error('No se encontró res.socket.server');
      res.status(500).send('Servidor no configurado para WebSocket');
      return;
    }

    res.status(200).end();
  } else {
    console.log('Solicitud HTTP normal');
    res.status(200).send('Use WebSocket to connect a client');
  }
};
