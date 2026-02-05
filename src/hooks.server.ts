import { sequence } from '@sveltejs/kit/hooks';
import { createAuthHandle, createHandoffHandler } from '@authrim/sveltekit/server';
import { env } from '$env/dynamic/public';

const issuer = env.PUBLIC_AUTHRIM_ISSUER;
const clientId = env.PUBLIC_AUTHRIM_CLIENT_ID;

if (!issuer || !clientId) {
	console.warn(
		'[Authrim] Missing environment variables. Set PUBLIC_AUTHRIM_ISSUER and PUBLIC_AUTHRIM_CLIENT_ID.'
	);
}

export const handle = sequence(
	createAuthHandle({
		issuer: issuer || '',
		clientId: clientId || '',
		callbackPaths: ['/callback']
	}),
	createHandoffHandler({
		issuer: issuer || '',
		clientId: clientId || '',
		errorRedirect: '/login?error=handoff_failed'
	})
);
