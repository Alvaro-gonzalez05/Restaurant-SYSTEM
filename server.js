require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
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

app.post('/emit-new-order', (req, res) => {
  const order = req.body;
  io.emit('new-order', order);
  res.status(200).json({ ok: true });
});

// Función para emitir un nuevo pedido desde otro archivo si lo necesitas
module.exports.notifyNewOrder = (order) => {
  io.emit('new-order', order);
};

server.listen(PORT, () => {
  console.log(`Servidor WebSocket escuchando en el puerto ${PORT}`);
});
