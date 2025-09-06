import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket() {
	if (!socket) {
		socket = io(SOCKET_URL, { autoConnect: true, transports: ['websocket'] });
	}
	return socket;
}


