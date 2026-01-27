<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getAuthContext, type SocialProvider } from '@authrim/sveltekit';
	import {
		Card,
		Button,
		EmailCodeForm,
		SocialLoginButtons,
		PasskeyConditionalInput,
		AuthError
	} from '@authrim/sveltekit/ui';
	import type { EmailCodeStep } from '@authrim/sveltekit/ui';

	const auth = getAuthContext();

	let emailStep: EmailCodeStep = $state('email');
	let email = $state('');
	let loading = $state(false);
	let loadingProvider: SocialProvider | undefined = $state(undefined);
	let error = $state('');

	const redirectTo = $derived($page.url.searchParams.get('redirectTo') || '/');

	// Start Passkey Conditional UI on mount
	onMount(async () => {
		const isAvailable = await auth.passkey.isConditionalUIAvailable();

		if (isAvailable) {
			// Start conditional UI in background - this waits for user to select from autofill
			auth.passkey.login({ conditional: true }).then((result) => {
				if (result.data) {
					goto(redirectTo);
				} else if (result.error && result.error.code !== 'AbortError') {
					// Log non-abort errors (network errors, etc.) for debugging
					console.error('[Passkey Conditional UI]', result.error);
				}
			});
		}
	});

	// Cancel conditional UI when leaving the page
	onDestroy(() => {
		auth.passkey.cancelConditionalUI();
	});

	async function handlePasskeyLogin() {
		loading = true;
		error = '';
		try {
			const result = await auth.passkey.login();
			if (result.error) {
				error = result.error.message;
			} else {
				goto(redirectTo);
			}
		} finally {
			loading = false;
		}
	}

	async function handleEmailSubmit(e: CustomEvent<{ email: string }>) {
		loading = true;
		error = '';
		email = e.detail.email;
		try {
			const result = await auth.emailCode.send(email, { action: 'login' });
			if (result.error) {
				error = result.error.message;
			} else {
				emailStep = 'code';
			}
		} finally {
			loading = false;
		}
	}

	async function handleCodeSubmit(e: CustomEvent<{ code: string }>) {
		loading = true;
		error = '';
		try {
			const result = await auth.emailCode.verify(email, e.detail.code, { action: 'login' });
			if (result.error) {
				error = result.error.message;
			} else {
				goto(redirectTo);
			}
		} finally {
			loading = false;
		}
	}

	async function handleSocialLogin(e: CustomEvent<{ provider: SocialProvider }>) {
		const provider = e.detail.provider;
		loadingProvider = provider;
		error = '';
		try {
			const result = await auth.social.loginWithPopup(provider, { redirectTo });
			if (result.error) {
				error = result.error.message;
			} else {
				// Use validated redirectTo from SDK response (or fallback to local redirectTo)
				goto(result.data?.redirectTo || redirectTo);
			}
		} finally {
			loadingProvider = undefined;
		}
	}

	function handleBack() {
		emailStep = 'email';
	}

	function dismissError() {
		error = '';
	}
</script>

<div class="login-page">
	<Card padding="lg" shadow="lg" class="login-card">
		<div class="header">
			<h1>Welcome back</h1>
			<p>Sign in to your account</p>
		</div>

		{#if error}
			<AuthError message={error} on:dismiss={dismissError} />
		{/if}

		<div class="content">
			{#if emailStep === 'email'}
				<div class="passkey-section">
					<PasskeyConditionalInput
						placeholder="Email or username"
						disabled={loading}
					/>
					<Button
						fullWidth
						size="lg"
						{loading}
						on:click={handlePasskeyLogin}
					>
						Continue with Passkey
					</Button>
				</div>

				<div class="divider">
					<span>or continue with email</span>
				</div>
			{/if}

			<EmailCodeForm
				step={emailStep}
				{email}
				{loading}
				on:submit-email={handleEmailSubmit}
				on:submit-code={handleCodeSubmit}
				on:back={handleBack}
			/>

			{#if emailStep === 'email'}
				<div class="divider">
					<span>or</span>
				</div>

				<SocialLoginButtons
					providers={['google', 'github', 'apple']}
					loading={!!loadingProvider}
					{loadingProvider}
					on:click={handleSocialLogin}
				/>
			{/if}
		</div>

		<div class="footer">
			<p>
				Don't have an account?
				<a href="/signup">Sign up</a>
			</p>
		</div>
	</Card>
</div>

<style>
	.login-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 1rem;
		background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%);
	}

	:global(.login-card) {
		width: 100%;
		max-width: 420px;
	}

	.header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.header h1 {
		margin: 0 0 0.5rem;
		font-size: 1.75rem;
		font-weight: 700;
		color: #111;
	}

	.header p {
		margin: 0;
		color: #666;
		font-size: 0.875rem;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.passkey-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: #9ca3af;
		font-size: 0.875rem;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: #e5e7eb;
	}

	.footer {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
		text-align: center;
	}

	.footer p {
		margin: 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.footer a {
		color: #6366f1;
		text-decoration: none;
		font-weight: 500;
	}

	.footer a:hover {
		text-decoration: underline;
	}
</style>
