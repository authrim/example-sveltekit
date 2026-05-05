import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { createDirectAuthSessionHandlers } from '@authrim/sveltekit/server';

export function getDirectAuthSessionHandlers() {
	const issuer = publicEnv.PUBLIC_AUTHRIM_ISSUER;
	const clientId = publicEnv.PUBLIC_AUTHRIM_CLIENT_ID;
	const sessionSecret = privateEnv.AUTHRIM_SESSION_SECRET;

	if (!issuer || !clientId || !sessionSecret) {
		throw new Error(
			'Missing Authrim environment variables. Set PUBLIC_AUTHRIM_ISSUER, PUBLIC_AUTHRIM_CLIENT_ID, and AUTHRIM_SESSION_SECRET.'
		);
	}

	return createDirectAuthSessionHandlers({
		issuer,
		clientId,
		sessionSecret
	});
}
