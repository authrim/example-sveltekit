import { sequence } from '@sveltejs/kit/hooks';
import { createAuthHandle, createHandoffHandler } from '@authrim/sveltekit/server';
import { env as privateEnv } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';

const issuer = env.PUBLIC_AUTHRIM_ISSUER;
const clientId = env.PUBLIC_AUTHRIM_CLIENT_ID;
const sessionSecret = privateEnv.AUTHRIM_SESSION_SECRET;

if (!issuer || !clientId || !sessionSecret) {
	console.warn(
		'[Authrim] Missing environment variables. Set PUBLIC_AUTHRIM_ISSUER, PUBLIC_AUTHRIM_CLIENT_ID, and AUTHRIM_SESSION_SECRET.'
	);
}

export const handle = sequence(
	createAuthHandle({
		callbackPaths: ['/callback'],
		sessionSecret
	}),
	createHandoffHandler({
		issuer: issuer || '',
		clientId: clientId || '',
		errorRedirect: '/login?error=handoff_failed',
		sessionOptions: {
			sessionSecret
		}
	})
);
