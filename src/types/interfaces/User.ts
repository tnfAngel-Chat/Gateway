import type { UserStatusTypes } from '../enums/UserStatusTypes';
import type { UserTypes } from '../enums/UserTypes';

export interface IRawUser {
	type: UserTypes;
	id: string;
	username: string;
	status: UserStatusTypes;
	avatar?: string | null;
	presence?: string | null;
}
