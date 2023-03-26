import 'dotenv/config';
import cors from 'cors';
import axios from 'axios';
import express from 'express';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';

const app = express();

app.use(cors());

const server = createServer(app);

const io = new IOServer(server, {
	cors: {
		origin: true,
		methods: ['GET', 'POST', 'PATCH', 'DELETE'],
		credentials: true
	}
});

app.get('/', (req, res) => {
	res.json({ uri: `wss://${process.env.DEV_URL}` });
});

server.listen(process.env.PORT, () => {
	console.log(`Listening on *:${process.env.DEV_URL}`);
});
