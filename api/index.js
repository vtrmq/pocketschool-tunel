// api/server.js
module.exports = (req, res) => {
  // Verificar si es una solicitud de WebSocket
  if (req.headers.upgrade === 'websocket') {
    res.end('WebSocket no soportado directamente en Vercel Serverless Functions');
    return;
  }
  
  // Respuesta HTTP normal
  res.json({
    status: 'success',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    info: 'Para crear un túnel, necesitarás usar un enfoque HTTP polling o una solución alternativa'
  });
};
