import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect until authenticated
  withCredentials: true, // Crucial for sending the JWT cookie to the WebSocket handshake
});
