import { env } from '$env/dynamic/public';

export interface AuthConfig {
	issuer: string;
	clientId: string;
	tenantId?: string;
	commonEntryUrl?: string;
}

export function getAuthConfig(): AuthConfig {
	const issuer = env.PUBLIC_AUTHRIM_ISSUER;
	const clientId = env.PUBLIC_AUTHRIM_CLIENT_ID;
	const tenantId = env.PUBLIC_AUTHRIM_TENANT_ID;
	const commonEntryUrl = env.PUBLIC_AUTHRIM_COMMON_ENTRY_URL;

	if (!issuer) {
		throw new Error('PUBLIC_AUTHRIM_ISSUER is not set');
	}

	if (!clientId) {
		throw new Error('PUBLIC_AUTHRIM_CLIENT_ID is not set');
	}

	return {
		issuer,
		clientId,
		tenantId: tenantId || undefined,
		commonEntryUrl: commonEntryUrl || undefined
	};
}
