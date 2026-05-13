import { BrowserHttpClient, TenantDiscoveryClient } from '@authrim/sveltekit';
import { getAuthConfig } from './config.js';

export async function discoverTenantByEmail(email: string) {
	const config = getAuthConfig();
	const client = new TenantDiscoveryClient({
		http: new BrowserHttpClient(),
		baseUrl: config.commonEntryUrl ?? config.issuer
	});

	return client.discover({ email });
}
