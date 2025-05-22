const WebSocket = require('ws');
const https = require('https');

const REMOTE_WS_URL = 'wss://pocketschool-tunel.onrender.com';
const LOCAL_SERVER_PORT = 5173;

const ws = new WebSocket(REMOTE_WS_URL);

ws.on('open', () => {
  console.log('Conectado al servidor remoto en Render');
});

ws.on('message', (message) => {
  try {
    const { id, method, url, headers, body } = JSON.parse(message);
    console.log('Solicitud recibida del servidor remoto:', { id, method, url });

    const options = {
      hostname: 'localhost',
      port: LOCAL_SERVER_PORT,
      path: url,
      method,
      headers,
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const contentType = res.headers['content-type'] || 'text/html';
        console.log('Respuesta enviada al servidor remoto:', {
          id,
          status: res.statusCode,
          contentType
        });

        // Evitar enviar text/html para módulos JavaScript si es un error
        if (res.statusCode >= 400 && contentType.includes('text/html')) {
          ws.send(JSON.stringify({
            id,
            data: 'Recurso no encontrado',
            headers: { 'Content-Type': 'text/plain' },
            status: res.statusCode
          }));
        } else {
          ws.send(JSON.stringify({
            id,
            data,
            headers: {
              'Content-Type': contentType,
              ...res.headers
            },
            status: res.statusCode
          }));
        }
      });
    });

    req.on('error', (err) => {
      console.error('Error al conectar con el servidor local:', err.message);
      ws.send(JSON.stringify({
        id,
        data: 'Error interno del cliente',
        headers: { 'Content-Type': 'text/plain' },
        status: 500
      }));
    });

    if (body) {
      req.write(body);
    }
    req.end();
  } catch (err) {
    console.error('Error procesando mensaje:', err.message);
  }
});

ws.on('error', (err) => {
  console.error('Error en WebSocket:', err.message);
});

ws.on('close', () => {
  console.log('Desconectado del servidor remoto');
});
