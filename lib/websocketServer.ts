import WebSocket, { WebSocketServer } from 'ws';

// Crear un servidor WebSocket
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Cliente conectado al WebSocket');

  ws.on('message', (data) => {
    const message = data.toString(); // Convertir el mensaje a string
    console.log('Mensaje recibido:', message);
  });

  ws.on('close', () => {
    console.log('Cliente desconectado del WebSocket');
  });
});

// Función para notificar a los clientes sobre un nuevo pedido
export const notifyNewOrder = (order: { id: number; customer_name: string }) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'new-order', data: order }));
    }
  });
};