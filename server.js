require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket server running');
});

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

// Función para emitir un nuevo pedido desde otro archivo si lo necesitas
module.exports.notifyNewOrder = (order) => {
  io.emit('new-order', order);
};

server.listen(PORT, () => {
  console.log(`Servidor WebSocket escuchando en el puerto ${PORT}`);
});
