const WebSocket = require('ws');

module.exports = (req, res) => {
  console.log('Solicitud recibida:', req.url, req.headers);

  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    console.log('Iniciando actualización WebSocket');

    // Crear servidor WebSocket
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', (ws) => {
      console.log('Cliente conectado');
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
        console.log('Procesando solicitud de upgrade:', request.url);
        if (request.url === '/api') {
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

    // Enviar respuesta vacía para completar la solicitud inicial
    res.status(200).end();
  } else {
    // Manejar solicitudes HTTP normales
    console.log('Solicitud HTTP normal');
    res.status(200).send('Use WebSocket to connect a client');
  }
};
