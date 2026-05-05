import type { RequestHandler } from './$types';
import { getDirectAuthSessionHandlers } from '$lib/server-auth.js';

export const POST: RequestHandler = (event) =>
	getDirectAuthSessionHandlers().exchange(event);
