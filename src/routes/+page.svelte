<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getAuthContext } from '@authrim/sveltekit';
	import { Card, Button, Spinner } from '@authrim/sveltekit/ui';

	const auth = getAuthContext();
	const { session, user, isAuthenticated, loadingState } = auth.stores;

	let signingOut = $state(false);
	let ssoLoading = $state(false);

	// Session is automatically checked via:
	// 1. Server-side: hooks.server.ts loads session into locals
	// 2. Client-side: AuthProvider syncs session from SSR and revalidates

	// Try automatic silent SSO on first visit
	onMount(() => {
		if (!$isAuthenticated && auth.oauth) {
			const ssoAttempted = sessionStorage.getItem('sso_attempted');
			if (!ssoAttempted) {
				sessionStorage.setItem('sso_attempted', 'true');
				// Try silent SSO (will redirect if successful or if login_required)
				auth.oauth.trySilentLogin({
					onLoginRequired: 'return',
					returnTo: window.location.href,
				}).catch((err) => {
					console.error('SSO error:', err);
				});
			}
		}
	});

	async function handleSignOut() {
		signingOut = true;
		try {
			await auth.signOut();
			// Clear SSO flag to allow retry on next visit
			sessionStorage.removeItem('sso_attempted');
			goto('/');
		} finally {
			signingOut = false;
		}
	}

	async function handleSSOLogin() {
		if (!auth.oauth) {
			console.error('OAuth is not enabled');
			return;
		}

		ssoLoading = true;
		try {
			await auth.oauth.trySilentLogin({
				onLoginRequired: 'login',
				returnTo: window.location.href,
			});
		} catch (err) {
			console.error('SSO login error:', err);
			ssoLoading = false;
		}
	}
</script>

<div class="home">
	<div class="container">
		<header class="header">
			<h1>Authrim SvelteKit Example</h1>
			<p class="subtitle">A complete authentication demo using @authrim/sveltekit</p>
		</header>

		{#if $loadingState === 'authenticating'}
			<Card padding="lg" class="loading-card">
				<div class="loading-content">
					<Spinner size="md" />
					<p>Checking session...</p>
				</div>
			</Card>
		{:else if $isAuthenticated && $user}
			<Card padding="lg" class="user-card">
				<div class="user-info">
					<div class="avatar">
						{$user.name?.charAt(0).toUpperCase() || $user.email?.charAt(0).toUpperCase() || '?'}
					</div>
					<div class="user-details">
						<h2>{$user.name || 'User'}</h2>
						{#if $user.email}
							<p class="email">{$user.email}</p>
						{/if}
					</div>
				</div>

				<div class="session-info">
					<h3>Session Information</h3>
					{#if $session}
						<dl>
							<dt>Session ID</dt>
							<dd>{$session.id.slice(0, 8)}...</dd>
							<dt>Expires At</dt>
							<dd>{new Date($session.expiresAt).toLocaleString()}</dd>
						</dl>
					{/if}
				</div>

				<div class="actions">
					<Button variant="outline" href="/account">
						Account Settings
					</Button>
					<Button variant="destructive" loading={signingOut} on:click={handleSignOut}>
						Sign Out
					</Button>
				</div>
			</Card>
		{:else}
			<Card padding="lg" class="welcome-card">
				<h2>Welcome</h2>
				<p>Sign in or create an account to get started.</p>

				<div class="auth-actions">
					<Button href="/login" size="lg" fullWidth>
						Sign In
					</Button>
					{#if auth.oauth}
						<Button variant="secondary" size="lg" fullWidth loading={ssoLoading} on:click={handleSSOLogin}>
							SSO Login
						</Button>
					{/if}
					<Button href="/signup" variant="outline" size="lg" fullWidth>
						Create Account
					</Button>
				</div>
			</Card>
		{/if}

		<section class="features">
			<h3>Features Demonstrated</h3>
			<ul>
				<li>Passkey Authentication (WebAuthn)</li>
				<li>Email Code Authentication (Passwordless)</li>
				<li>Social Login (Google, GitHub, Apple)</li>
				<li>OAuth 2.0 / OpenID Connect SSO</li>
				<li>Silent Authentication (prompt=none)</li>
				<li>Session Management</li>
				<li>Passkey Management</li>
				<li>Server-side Session Validation</li>
			</ul>
		</section>
	</div>
</div>

<style>
	.home {
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
	}

	.container {
		max-width: 600px;
		margin: 0 auto;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
		color: #111;
	}

	.subtitle {
		margin: 0;
		color: #666;
	}

	:global(.user-card),
	:global(.welcome-card),
	:global(.loading-card) {
		margin-bottom: 2rem;
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem 0;
	}

	.loading-content p {
		margin: 0;
		color: #666;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.user-details h2 {
		margin: 0 0 0.25rem;
		font-size: 1.25rem;
	}

	.email {
		margin: 0;
		color: #666;
		font-size: 0.875rem;
	}

	.session-info {
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.session-info h3 {
		margin: 0 0 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.session-info dl {
		margin: 0;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	.session-info dt {
		color: #6b7280;
	}

	.session-info dd {
		margin: 0;
		color: #111827;
		font-family: monospace;
	}

	.actions {
		display: flex;
		gap: 1rem;
	}

	:global(.welcome-card) h2 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
	}

	:global(.welcome-card) p {
		margin: 0 0 1.5rem;
		color: #666;
	}

	.auth-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.features {
		padding: 1.5rem;
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.features h3 {
		margin: 0 0 1rem;
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
	}

	.features ul {
		margin: 0;
		padding-left: 1.25rem;
		color: #4b5563;
	}

	.features li {
		margin-bottom: 0.5rem;
	}

	.features li:last-child {
		margin-bottom: 0;
	}
</style>
