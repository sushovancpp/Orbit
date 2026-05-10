const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { Chat } = require('./models');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
    pingTimeout: 60000,
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('_id username avatar');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch { next(new Error('Auth failed')); }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    socket.join(userId);
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    socket.broadcast.emit('user:online', { userId });

    // Join chat rooms the user belongs to
    const chats = await Chat.find({ members: userId }).select('_id');
    chats.forEach(c => socket.join(c._id.toString()));

    // ── Chat ────────────────────────────────────────────────────────────────
    socket.on('chat:send', async ({ chatId, content, media }) => {
      try {
        const chat = await Chat.findOne({ _id: chatId, members: userId });
        if (!chat) return;
        const msg = { sender: userId, content, media, readBy: [userId], createdAt: new Date() };
        chat.messages.push(msg);
        chat.lastActivity = new Date();
        await chat.save();
        const saved = chat.messages[chat.messages.length - 1];
        io.to(chatId).emit('chat:message', { chatId, message: { ...saved.toObject(), sender: socket.user } });
      } catch (err) { console.error('chat:send error', err.message); }
    });

    socket.on('chat:typing', ({ chatId }) => {
      socket.to(chatId).emit('chat:typing', { chatId, user: socket.user });
    });

    socket.on('chat:read', async ({ chatId }) => {
      await Chat.updateOne(
        { _id: chatId },
        { $addToSet: { 'messages.$[].readBy': userId } }
      );
      socket.to(chatId).emit('chat:read', { chatId, userId });
    });

    // ── WebRTC Signaling ────────────────────────────────────────────────────
    socket.on('call:offer', ({ to, offer, type }) => {
      io.to(to).emit('call:offer', { from: userId, fromUser: socket.user, offer, type });
    });

    socket.on('call:answer', ({ to, answer }) => {
      io.to(to).emit('call:answer', { from: userId, answer });
    });

    socket.on('call:ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('call:ice-candidate', { from: userId, candidate });
    });

    socket.on('call:end', ({ to }) => {
      io.to(to).emit('call:end', { from: userId });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      socket.broadcast.emit('user:offline', { userId });
    });
  });

  console.log('🔌 Socket.io initialized');
};

const getIO = () => io;

module.exports = { initSocket, getIO };
