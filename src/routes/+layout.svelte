<script lang="ts">
	import { onMount } from 'svelte';
	import { AuthProvider } from '@authrim/sveltekit/components';
	import type { AuthrimClient } from '@authrim/sveltekit';
	import '@authrim/sveltekit/ui/styles';

	let { data, children } = $props();

	let auth: AuthrimClient | null = $state(null);
	let isInitializing = $state(true);

	onMount(async () => {
		try {
			const { getAuth } = await import('$lib/auth.js');
			auth = await getAuth();
		} catch (e) {
			console.error('[Authrim] Failed to initialize auth:', e);
		} finally {
			isInitializing = false;
		}
	});
</script>

<svelte:head>
	<style>
		:root {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		}

		body {
			margin: 0;
			padding: 0;
			background-color: #f5f5f5;
		}
	</style>
</svelte:head>

{#if isInitializing}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Loading...</p>
	</div>
{:else if auth}
	<AuthProvider
		{auth}
		initialSession={data.auth?.session ?? null}
		initialUser={data.auth?.user ?? null}
	>
		{@render children()}
	</AuthProvider>
{:else}
	<div class="error-container">
		<p>Failed to initialize authentication</p>
		<button class="retry-button" onclick={() => window.location.reload()}>
			Retry
		</button>
	</div>
{/if}

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		color: #666;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e0e0e0;
		border-top: 3px solid #6366f1;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 100vh;
		color: #ef4444;
	}

	.retry-button {
		padding: 0.5rem 1rem;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		color: white;
		background: #6366f1;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.retry-button:hover {
		background: #4f46e5;
	}
</style>
