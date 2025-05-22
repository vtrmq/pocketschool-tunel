// api/server.js
import { WebSocketPair } from 'next/websocket';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Verificar si la solicitud es para establecer una conexión WebSocket
  const upgradeHeader = request.headers.get('upgrade');
  
  if (upgradeHeader !== 'websocket') {
    return new Response('Se requiere una conexión WebSocket', { 
      status: 426,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Crear un par de WebSockets
  const { 0: client, 1: server } = new WebSocketPair();
  
  // Configurar el WebSocket del servidor
  server.accept();
  
  // Manejar eventos del WebSocket
  server.addEventListener('message', (event) => {
    console.log(`Mensaje recibido: ${event.data}`);
    server.send(JSON.stringify({
      status: 'success',
      message: 'Conexión WebSocket establecida correctamente',
      timestamp: new Date().toISOString(),
      received: event.data
    }));
  });

  // Enviar un mensaje inicial cuando se conecta
  server.send(JSON.stringify({
    status: 'connected',
    message: 'Servidor WebSocket en Vercel conectado correctamente',
    timestamp: new Date().toISOString()
  }));
  
  // Devolver la respuesta con el WebSocket del cliente
  return new Response(null, {
    status: 101,
    webSocket: client
  });
}
