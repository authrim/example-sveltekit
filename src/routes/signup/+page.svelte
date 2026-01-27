<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAuthContext, type SocialProvider } from '@authrim/sveltekit';
	import {
		Card,
		Button,
		Input,
		SocialLoginButtons,
		OTPInput,
		ResendCodeButton,
		AuthError
	} from '@authrim/sveltekit/ui';

	const auth = getAuthContext();

	let step: 'form' | 'code' = $state('form');
	let name = $state('');
	let email = $state('');
	let code = $state('');
	let loading = $state(false);
	let loadingProvider: SocialProvider | undefined = $state(undefined);
	let error = $state('');
	let resendTime = $state(0);

	async function handlePasskeySignup() {
		if (!name.trim()) return;

		loading = true;
		error = '';
		try {
			const result = await auth.passkey.signUp({ name: name.trim() });
			if (result.error) {
				error = result.error.message;
			} else {
				goto('/');
			}
		} finally {
			loading = false;
		}
	}

	async function handleEmailSubmit() {
		if (!name.trim() || !email.trim()) return;

		loading = true;
		error = '';
		try {
			const result = await auth.emailCode.send(email, {
				action: 'signup',
				name: name.trim()
			});
			if (result.error) {
				error = result.error.message;
			} else {
				step = 'code';
				if (result.data?.nextAction) {
					resendTime = Math.ceil(result.data.nextAction.retryAfter / 1000);
				}
			}
		} finally {
			loading = false;
		}
	}

	async function handleCodeComplete(e: CustomEvent<{ value: string }>) {
		code = e.detail.value;
		await verifyCode();
	}

	async function verifyCode() {
		if (code.length < 6) return;

		loading = true;
		error = '';
		try {
			const result = await auth.emailCode.verify(email, code, { action: 'signup' });
			if (result.error) {
				error = result.error.message;
			} else {
				goto('/');
			}
		} finally {
			loading = false;
		}
	}

	async function handleResend() {
		loading = true;
		error = '';
		try {
			const result = await auth.emailCode.send(email, {
				action: 'signup',
				name: name.trim()
			});
			if (result.error) {
				error = result.error.message;
			} else if (result.data?.nextAction) {
				resendTime = Math.ceil(result.data.nextAction.retryAfter / 1000);
			}
		} finally {
			loading = false;
		}
	}

	async function handleSocialSignup(e: CustomEvent<{ provider: SocialProvider }>) {
		const provider = e.detail.provider;
		loadingProvider = provider;
		error = '';
		try {
			const result = await auth.social.loginWithPopup(provider);
			if (result.error) {
				error = result.error.message;
			} else {
				goto('/');
			}
		} finally {
			loadingProvider = undefined;
		}
	}

	function handleBack() {
		step = 'form';
		code = '';
	}

	function dismissError() {
		error = '';
	}
</script>

<div class="signup-page">
	<Card padding="lg" shadow="lg" class="signup-card">
		{#if step === 'form'}
			<div class="header">
				<h1>Create account</h1>
				<p>Get started with your free account</p>
			</div>

			{#if error}
				<AuthError message={error} on:dismiss={dismissError} />
			{/if}

			<div class="content">
				<form on:submit|preventDefault={handlePasskeySignup} class="form">
					<Input
						label="Name"
						placeholder="Your name"
						bind:value={name}
						disabled={loading}
						required
						fullWidth
						size="lg"
					/>

					<Button
						type="submit"
						fullWidth
						size="lg"
						{loading}
						disabled={!name.trim()}
					>
						Create account with Passkey
					</Button>
				</form>

				<div class="divider">
					<span>or sign up with email</span>
				</div>

				<form on:submit|preventDefault={handleEmailSubmit} class="form">
					<Input
						type="email"
						label="Email"
						placeholder="you@example.com"
						bind:value={email}
						disabled={loading}
						required
						fullWidth
						size="lg"
					/>

					<Button
						type="submit"
						variant="outline"
						fullWidth
						size="lg"
						{loading}
						disabled={!name.trim() || !email.trim()}
					>
						Continue with Email
					</Button>
				</form>

				<div class="divider">
					<span>or sign up with</span>
				</div>

				<SocialLoginButtons
					providers={['google', 'github', 'apple']}
					loading={!!loadingProvider}
					{loadingProvider}
					on:click={handleSocialSignup}
				/>
			</div>

		{:else}
			<button type="button" class="back-button" on:click={handleBack}>
				<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
				</svg>
				Back
			</button>

			<div class="header">
				<h1>Verify your email</h1>
				<p>We sent a code to <strong>{email}</strong></p>
			</div>

			{#if error}
				<AuthError message={error} on:dismiss={dismissError} />
			{/if}

			<div class="code-section">
				<OTPInput
					bind:value={code}
					disabled={loading}
					on:complete={handleCodeComplete}
				/>

				<div class="resend-section">
					<span>Didn't receive the code?</span>
					<ResendCodeButton
						remainingTime={resendTime}
						{loading}
						on:click={handleResend}
					/>
				</div>

				<Button
					fullWidth
					size="lg"
					{loading}
					disabled={code.length < 6}
					on:click={verifyCode}
				>
					Verify
				</Button>
			</div>
		{/if}
	</Card>

	{#if step === 'form'}
		<div class="footer">
			<p>
				Already have an account?
				<a href="/login">Sign in</a>
			</p>
		</div>
	{/if}
</div>

<style>
	.signup-page {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 1rem;
		background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%);
	}

	:global(.signup-card) {
		width: 100%;
		max-width: 420px;
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		margin: 0 0 1rem -0.5rem;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
		background: transparent;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: color 0.15s, background-color 0.15s;
	}

	.back-button:hover {
		color: #111;
		background: #f3f4f6;
	}

	.back-button svg {
		width: 18px;
		height: 18px;
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

	.header strong {
		color: #111;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form {
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

	.code-section {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.resend-section {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		flex-wrap: wrap;
		font-size: 0.875rem;
		color: #9ca3af;
	}

	.footer {
		margin-top: 1rem;
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
