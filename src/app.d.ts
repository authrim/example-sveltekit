import type { ServerAuthContext } from '@authrim/sveltekit/server';

declare global {
	namespace App {
		interface Locals {
			auth?: ServerAuthContext;
		}
		interface PageData {
			auth: ServerAuthContext | null;
		}
		// interface Error {}
		interface Platform {
			env?: {
				PUBLIC_AUTHRIM_ISSUER?: string;
				PUBLIC_AUTHRIM_CLIENT_ID?: string;
			};
		}
	}
}

export {};
