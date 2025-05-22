const WebSocket = require('ws');

module.exports = (req, res) => {
  // Verificar si la solicitud es una conexión WebSocket
  if (req.headers['upgrade'] === 'websocket') {
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

    // Manejar la actualización a WebSocket
    res.socket.server.on('upgrade', (request, socket, head) => {
      if (request.url === '/api') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    });

    // Enviar respuesta vacía para completar la solicitud HTTP inicial
    res.status(200).end();
  } else {
    // Manejar solicitudes HTTP normales
    res.status(200).send('Use WebSocket to connect a client');
  }
};
