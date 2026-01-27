import { env } from '$env/dynamic/public';

export interface AuthConfig {
	issuer: string;
	clientId: string;
}

export function getAuthConfig(): AuthConfig {
	const issuer = env.PUBLIC_AUTHRIM_ISSUER;
	const clientId = env.PUBLIC_AUTHRIM_CLIENT_ID;

	if (!issuer) {
		throw new Error('PUBLIC_AUTHRIM_ISSUER is not set');
	}

	if (!clientId) {
		throw new Error('PUBLIC_AUTHRIM_CLIENT_ID is not set');
	}

	return {
		issuer,
		clientId
	};
}
