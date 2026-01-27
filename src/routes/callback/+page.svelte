<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getAuthContext } from '@authrim/sveltekit';
	import { Card, Spinner, AuthError } from '@authrim/sveltekit/ui';

	const auth = getAuthContext();

	let processing = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			if (auth.social.hasCallbackParams()) {
				const result = await auth.social.handleCallback();
				if (result.error) {
					error = result.error.message;
					processing = false;
				} else {
					// Use validated redirectTo from SDK (defaults to '/')
					goto(result.data?.redirectTo || '/');
				}
			} else {
				error = 'No callback parameters found';
				processing = false;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'An unexpected error occurred';
			processing = false;
		}
	});

</script>

<div class="callback-page">
	<Card padding="lg" shadow="lg" class="callback-card">
		{#if processing}
			<div class="processing">
				<Spinner size="lg" />
				<h2>Completing sign in...</h2>
				<p>Please wait while we verify your credentials</p>
			</div>
		{:else if error}
			<div class="error-container">
				<div class="error-icon">!</div>
				<h2>Authentication Failed</h2>
				<AuthError message={error} />
				<div class="actions">
					<a href="/login" class="button-primary">Try Again</a>
					<a href="/" class="button-secondary">Go Home</a>
				</div>
			</div>
		{/if}
	</Card>
</div>

<style>
	.callback-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 1rem;
		background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%);
	}

	:global(.callback-card) {
		width: 100%;
		max-width: 420px;
		text-align: center;
	}

	.processing {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem 0;
	}

	.processing h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111;
	}

	.processing p {
		margin: 0;
		color: #666;
		font-size: 0.875rem;
	}

	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1rem 0;
	}

	.error-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: #fee2e2;
		color: #ef4444;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.error-container h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.button-primary,
	.button-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.15s;
	}

	.button-primary {
		background: #6366f1;
		color: white;
	}

	.button-primary:hover {
		background: #4f46e5;
	}

	.button-secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.button-secondary:hover {
		background: #e5e7eb;
	}
</style>
