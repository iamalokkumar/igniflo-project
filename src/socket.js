import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

export default socket;
