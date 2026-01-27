<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuthContext } from '@authrim/sveltekit';
	import {
		Card,
		Button,
		PasskeyList,
		PasskeyRegisterButton,
		SessionList,
		AuthError
	} from '@authrim/sveltekit/ui';
	import type { PasskeyItemDisplay, SessionItemDisplay } from '@authrim/sveltekit/ui';

	const auth = getAuthContext();
	const { session, user } = auth.stores;

	let passkeys: PasskeyItemDisplay[] = $state([]);
	let sessions: SessionItemDisplay[] = $state([]);
	let initialized = $state(false);
	let passkeyLoading = $state(false);
	let deletingPasskeyId: string | undefined = $state(undefined);
	let revokingSessionId: string | undefined = $state(undefined);
	let error = $state('');
	let signingOut = $state(false);

	// Note: These would typically be fetched from an API
	// For demo purposes, we show placeholder data
	$effect(() => {
		// Simulate loading passkeys and sessions (only on initial load)
		if ($session && $user && !initialized) {
			initialized = true;
			passkeys = [
				{
					credentialId: 'demo-passkey-1',
					name: 'MacBook Pro',
					createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
					lastUsedAt: new Date().toISOString()
				}
			];

			sessions = [
				{
					id: $session.id,
					device: 'Current Browser',
					location: 'Unknown Location',
					createdAt: new Date($session.issuedAt || Date.now()).toISOString(),
					lastActiveAt: new Date().toISOString(),
					isCurrent: true
				}
			];
		}
	});

	async function handlePasskeyRegister() {
		passkeyLoading = true;
		error = '';
		try {
			const result = await auth.passkey.register();
			if (result.error) {
				error = result.error.message;
			} else if (result.data) {
				passkeys = [
					...passkeys,
					{
						credentialId: result.data.credentialId,
						name: 'New Passkey',
						createdAt: new Date().toISOString(),
						lastUsedAt: new Date().toISOString()
					}
				];
			}
		} finally {
			passkeyLoading = false;
		}
	}

	async function handlePasskeyDelete(e: CustomEvent<{ credentialId: string }>) {
		const { credentialId } = e.detail;
		deletingPasskeyId = credentialId;
		error = '';
		try {
			// In a real app, call API to delete passkey
			await new Promise(resolve => setTimeout(resolve, 500));
			passkeys = passkeys.filter(p => p.credentialId !== credentialId);
		} catch {
			error = 'Failed to delete passkey';
		} finally {
			deletingPasskeyId = undefined;
		}
	}

	async function handleSessionRevoke(e: CustomEvent<{ sessionId: string }>) {
		const { sessionId } = e.detail;
		revokingSessionId = sessionId;
		error = '';
		try {
			// In a real app, call API to revoke session
			await new Promise(resolve => setTimeout(resolve, 500));
			sessions = sessions.filter(s => s.id !== sessionId);
		} catch {
			error = 'Failed to revoke session';
		} finally {
			revokingSessionId = undefined;
		}
	}

	async function handleSignOut() {
		signingOut = true;
		try {
			await auth.signOut();
			goto('/');
		} finally {
			signingOut = false;
		}
	}

	function dismissError() {
		error = '';
	}
</script>

<div class="account-page">
	<div class="container">
		<header class="header">
			<div class="header-content">
				<a href="/" class="back-link">
					<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
					</svg>
					Back to Home
				</a>
				<h1>Account Settings</h1>
			</div>
			<Button variant="destructive" loading={signingOut} on:click={handleSignOut}>
				Sign Out
			</Button>
		</header>

		{#if error}
			<AuthError message={error} on:dismiss={dismissError} />
		{/if}

		{#if $user}
			<Card padding="lg" class="profile-card">
				<div class="profile">
					<div class="avatar">
						{$user.name?.charAt(0).toUpperCase() || $user.email?.charAt(0).toUpperCase() || '?'}
					</div>
					<div class="profile-info">
						<h2>{$user.name || 'User'}</h2>
						{#if $user.email}
							<p>{$user.email}</p>
						{/if}
					</div>
				</div>
			</Card>
		{/if}

		<Card class="section-card">
			<div class="section-header">
				<div>
					<h2>Passkeys</h2>
					<p>Passkeys let you sign in securely without a password</p>
				</div>
				<PasskeyRegisterButton
					variant="outline"
					size="sm"
					loading={passkeyLoading}
					on:click={handlePasskeyRegister}
				/>
			</div>

			<PasskeyList
				{passkeys}
				loading={false}
				deletingId={deletingPasskeyId}
				on:delete={handlePasskeyDelete}
			/>
		</Card>

		<Card class="section-card">
			<div class="section-header">
				<div>
					<h2>Active Sessions</h2>
					<p>Manage your active sign-in sessions</p>
				</div>
			</div>

			<SessionList
				{sessions}
				currentSessionId={$session?.id}
				loading={false}
				revokingId={revokingSessionId}
				on:revoke={handleSessionRevoke}
			/>
		</Card>
	</div>
</div>

<style>
	.account-page {
		min-height: 100vh;
		padding: 2rem;
		background: #f5f5f5;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}

	.header-content h1 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		color: #111;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
		color: #6b7280;
		font-size: 0.875rem;
		text-decoration: none;
		transition: color 0.15s;
	}

	.back-link:hover {
		color: #111;
	}

	.back-link svg {
		width: 16px;
		height: 16px;
	}

	:global(.profile-card),
	:global(.section-card) {
		margin-bottom: 1.5rem;
	}

	.profile {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.profile-info h2 {
		margin: 0 0 0.25rem;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.profile-info p {
		margin: 0;
		color: #666;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.section-header h2 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
		color: #111;
	}

	.section-header p {
		margin: 0;
		font-size: 0.875rem;
		color: #666;
	}

	@media (max-width: 640px) {
		.account-page {
			padding: 1rem;
		}

		.header {
			flex-direction: column;
			gap: 1rem;
		}

		.section-header {
			flex-direction: column;
			gap: 0.75rem;
		}
	}
</style>
