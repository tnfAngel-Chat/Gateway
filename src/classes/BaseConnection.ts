import type { Socket } from 'socket.io';
import type { SocketServer } from './SocketServer';

export abstract class BaseConnection {
	protected server: SocketServer;
	protected socket: Socket;

	public constructor(server: SocketServer, socket: Socket) {
		this.server = server;
		this.socket = socket;
	}

	public abstract create(): Promise<void>;

	protected abstract setup(): void;

	protected abstract handleDisconnections(): void;
}
