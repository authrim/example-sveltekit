import { createAuthrim, type AuthrimClient } from '@authrim/sveltekit';
import { getAuthConfig } from './config.js';

let authClient: AuthrimClient | null = null;

export async function getAuth(): Promise<AuthrimClient> {
	if (authClient) {
		return authClient;
	}

	const config = getAuthConfig();
	authClient = await createAuthrim({
		issuer: config.issuer,
		clientId: config.clientId
	});

	return authClient;
}

export function clearAuth(): void {
	if (authClient) {
		authClient.destroy();
		authClient = null;
	}
}
