import http from 'http';
import { Server, Socket } from 'socket.io';
import { ClientConnection } from './ClientConnection';
import type { IRawChannel } from '../types/interfaces/Channel';
import type { IRawGuild } from '../types/interfaces/Guild';
import type { IRawUser } from '../types/interfaces/User';

export class SocketServer {
	private io: Server;
	private port: number;
	private http: http.Server;

	public connectedClients = new Map<string, string[]>();
	public cache = {
		guilds: new Map<string, IRawGuild>(),
		users: new Map<string, IRawUser>(),
		channels: new Map<string, IRawChannel>(),
		messages: new Map<string, IRawUser>()
	} as const;

	public constructor() {
		this.http = http.createServer((_req, res) => {
			res.writeHead(404);
			res.end();
		});

		this.io = new Server(this.http, {
			path: '/gateway/',
			serveClient: false,
			cors: {
				origin: [
					process.env.NODE_ENV === 'development'
						? 'http://localhost:4000'
						: 'https://gateway-chat.tnfangel.com'
				],
				methods: ['GET', 'POST', 'PATCH', 'DELETE'],
				credentials: true
			},
			transports: ['polling', 'websocket' /*'webtransport'*/],
			pingInterval: 3000
		});

		this.port = parseInt(process.env['PORT'] ?? '4001');
	}

	public async setup() {
		this.io.use(this.authenticateMW).on('connection', this.createConnection);

		this.listen();
	}

	private async authenticateMW(socket: Socket, next: (err?: any) => void) {
		if (socket.handshake.auth?.['token']) {
			const token = socket.handshake.auth['token'];

			if (!token.includes('.')) return next(new Error('Malformed Token'));

			if (token.split('.').length !== 3) return next(new Error('Malformed Token'));

			const user = token.split('.')[0];

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

	private listen() {
		this.http.listen(this.port, () => {
			console.log('Listening on port', this.port);
		});
	}
}
