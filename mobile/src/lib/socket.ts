import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (socket && socket.connected) return socket;
  socket = io(`${API_URL}/messaging`, {
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}