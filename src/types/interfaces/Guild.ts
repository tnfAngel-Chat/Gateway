import type { GuildTypes } from '../enums/GuildTypes';

export interface IRawGuild {
	type: GuildTypes;
	id: string;
	name: string;
	description: string;
	createdAt: number;
	owner: string;
	icon?: string;
}
