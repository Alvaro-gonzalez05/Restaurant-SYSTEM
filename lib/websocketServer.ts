import { NextApiHandler } from 'next';
import dotenv from 'dotenv';
dotenv.config();

let io: any;

const websocketHandler: NextApiHandler = (req, res) => {
  if (!io) {
    const httpServer = res.socket.server;
    io = require('socket.io')(httpServer, {
      cors: {
        origin: '*',
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

    console.log('Servidor WebSocket inicializado');
  }

  res.end();
};

export const notifyNewOrder = (order: { id: number; customer_name: string }) => {
  if (io) {
    io.emit('new-order', order);
  }
};

export default websocketHandler;