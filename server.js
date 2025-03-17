const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Chat Server');
});

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Set();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // إنشاء غرفة مع تحسين الأداء
  socket.on('create_room', (roomName, callback) => {
    if (!rooms.has(roomName)) {
      rooms.add(roomName);
      socket.join(roomName);
      callback({ status: 'success', room: roomName }); // إرسال رد سريع
      console.log(`🚪 Room created: ${roomName}`);
    } else {
      callback({ status: 'error', message: 'Room already exists!' });
    }
  });

  // الانضمام للغرفة مع تحسين السرعة
  socket.on('join_room', (roomName, callback) => {
    if (rooms.has(roomName)) {
      socket.join(roomName);
      callback({ status: 'success', room: roomName });
      console.log(`👥 User joined room: ${roomName}`);
    } else {
      callback({ status: 'error', message: 'Room not found!' });
    }
  });

  // إرسال الرسائل بشكل فعال
  socket.on('send_message', (data, callback) => {
    if (rooms.has(data.room)) {
      io.to(data.room).emit('receive_message', {
        sender: socket.id,
        message: data.message,
        timestamp: Date.now()
      });
      callback({ status: 'sent' }); // تأكيد الإرسال
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('🔥 Server running on port 3000');
});