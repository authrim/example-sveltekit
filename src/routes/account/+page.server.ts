import { requireAuth } from '@authrim/sveltekit/server';

export const load = requireAuth({
	loginUrl: '/login',
	redirectParam: 'redirectTo'
});
