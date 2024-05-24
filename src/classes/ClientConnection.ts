import type { Socket } from 'socket.io';
import { BaseConnection } from './BaseConnection';
import type { SocketServer } from './SocketServer';
import type { IRawGuild } from '../types/interfaces/Guild';
import type { IRawUser } from '../types/interfaces/User';
import type { IRawChannel } from '../types/interfaces/Channel';

export class ClientConnection extends BaseConnection {
	user: string | null;
	guilds: IRawGuild[];
	users: IRawUser[];
	channels: IRawChannel[];
	preferences: { theme: string };

	constructor(server: SocketServer, socket: Socket) {
		super(server, socket);

		// TODO: User accounts
		this.user = null;

		this.guilds = [...server.cache.guilds.values()];
		this.users = [...server.cache.users.values()];
		this.channels = [...server.cache.channels.values()];

		this.preferences = {
			theme: 'dark'
		};
	}

	override async create(): Promise<void> {
		this.setupUser();

		this.setup();
		this.emitReady();
		this.handleDisconnections();
	}

	protected setup() {
		const userConnections = this.server.connectedClients.get(this.user!) ?? [];

		userConnections.push(this.socket.id);

		this.server.connectedClients.set(this.user!, userConnections);

		this.socket.join(this.channels.map((channel) => channel.id));
	}

	protected handleDisconnections() {
		this.socket.on('disconnect', () => {
			const userConnections = this.server.connectedClients.get(this.user!) ?? [];

			this.server.connectedClients.set(
				this.user!,
				userConnections.filter((connId) => connId !== this.socket.id)
			);
		});
	}

	private setupUser() {
		const token: string = this.socket.handshake.auth['token'];

		this.user = token.split('.')[0] ?? '';
	}

	private emitReady() {
		this.socket.emit('ready', {
			guilds: this.guilds,
			users: this.users,
			channels: this.channels,
			preferences: this.preferences
		});
	}
}
