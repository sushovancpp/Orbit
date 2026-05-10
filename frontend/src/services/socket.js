import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io('/', { auth: { token }, transports: ['websocket'], autoConnect: true });
  socket.on('connect', () => console.log('🔌 Socket connected'));
  socket.on('connect_error', (e) => console.error('Socket error:', e.message));
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
