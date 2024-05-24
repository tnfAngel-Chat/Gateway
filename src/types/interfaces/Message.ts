import type { MessageModes } from '../enums/MessageModes';
import type { MessageTypes } from '../enums/MessageTypes';

export interface IRawMessage {
	type: MessageTypes;
	mode?: MessageModes;
	id: string;
	content: string;
	author: string;
	nonce: string;
	channelId: string;
	timestamp: number;
}
