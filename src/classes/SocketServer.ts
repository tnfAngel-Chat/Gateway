import { Server, Socket } from 'socket.io';
import { ClientConnection } from './ClientConnection';
import type { IRawChannel } from '../types/interfaces/Channel';
import type { IRawGuild } from '../types/interfaces/Guild';
import type { IRawUser } from '../types/interfaces/User';

export class SocketServer {
	private io: Server;

	public connectedClients = new Map<string, string[]>();
	public cache = {
		guilds: new Map<string, IRawGuild>(),
		users: new Map<string, IRawUser>(),
		channels: new Map<string, IRawChannel>(),
		messages: new Map<string, IRawUser>()
	} as const;

	public constructor() {
		const port = parseInt(process.env['PORT'] ?? '4001');

		this.io = new Server(port, {
			path: '/gateway/',
			serveClient: false,
			cors: {
				origin: [
					process.env.NODE_ENV === 'development'
						? 'http://localhost:4000'
						: 'https://gateway-chat.tnfangel.com'
				],
				methods: ['GET', 'POST', 'PATCH', 'DELETE'],
				credentials: false
			},
			transports: ['polling', 'websocket' /*'webtransport'*/],
			pingInterval: 3000
		});

		console.log('Listening to port', port);
	}

	public async setup() {
		this.io.use(this.authenticateMW).on('connection', this.createConnection);
	}

	private async authenticateMW(socket: Socket, next: (err?: any) => void) {
		if (socket.handshake.auth?.['token']) {
			const token = socket.handshake.auth['token'] as string;

			if (!token || typeof token !== 'string') next(new Error('Authentication error'));

			const splittedToken = token.split('.');

			if (splittedToken.length !== 3) return next(new Error('Malformed Token'));

			if (splittedToken.some((c) => !c)) return next(new Error('Malformed Token'));

			const user = splittedToken[0];

			if (!user) return next(new Error('Malformed Token'));

			const authenticated = true;

			if (!authenticated) {
				return next(new Error('Authentication error'));
			}

			return next();
		}

		return next(new Error('Authentication error'));
	}

	private async createConnection(socket: Socket) {
		const authType = socket.handshake.auth?.['type'];

		console.log('Connection:', socket.id, authType);

		await new ClientConnection(this, socket).create();
	}
}
