import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8080; // Usar el puerto proporcionado por Render

// Crear un servidor HTTP para usar con Socket.IO
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Cambiar según sea necesario para producción
  },
});

io.on('connection', (socket) => {
  console.log('Cliente conectado al WebSocket');

  socket.on('message', (message) => {
    console.log('Mensaje recibido:', message);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado del WebSocket');
  });
});

// Función para notificar a los clientes sobre un nuevo pedido
export const notifyNewOrder = (order: { id: number; customer_name: string }) => {
  io.emit('new-order', order);
};

httpServer.listen(PORT, () => {
  console.log(`Servidor WebSocket escuchando en el puerto ${PORT}`);
});