import type { RequestHandler } from './$types';
import { getDirectAuthSessionHandlers } from '$lib/server-auth.js';

export const GET: RequestHandler = (event) =>
	getDirectAuthSessionHandlers().session(event);
