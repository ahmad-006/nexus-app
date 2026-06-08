import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000'; // Base URL without /api

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect until authenticated
  withCredentials: true, // Crucial for sending the JWT cookie to the WebSocket handshake
});
