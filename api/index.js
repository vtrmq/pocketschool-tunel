const WebSocket = require('ws');

module.exports = (req, res) => {
  // Log para depurar la solicitud
  console.log('Solicitud recibida:', req.url, req.headers);

  // Verificar si es una solicitud WebSocket
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket' && req.url === '/api') {
    console.log('Iniciando conexión WebSocket');

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

    // Manejar la actualización WebSocket
    if (res.socket.server) {
      res.socket.server.on('upgrade', (request, socket, head) => {
        if (request.url === '/api') {
          console.log('Procesando upgrade para /api');
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        } else {
          socket.destroy();
        }
      });
    } else {
      console.error('No se encontró res.socket.server');
      res.status(500).send('Servidor no configurado para WebSocket');
      return;
    }

    res.status(200).end();
  } else {
    // Manejar solicitudes HTTP
    console.log('Solicitud HTTP normal');
    res.status(200).send('Use WebSocket to connect a client');
  }
};
