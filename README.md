# Authrim SvelteKit Example

A complete authentication demo using `@authrim/sveltekit`. Deploy to Cloudflare Pages or run locally.

## Features

- **Passkey Authentication** - WebAuthn-based passwordless login
- **Email Code Authentication** - Passwordless email verification
- **Social Login** - Google, GitHub, Apple
- **Session Management** - View and revoke active sessions
- **Passkey Management** - Add and remove passkeys
- **Server-side Validation** - Protected routes with SSR

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/authrim/example-sveltekit.git
cd example-sveltekit
pnpm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your Authrim credentials:

```env
PUBLIC_AUTHRIM_ISSUER=https://your-tenant.authrim.com
PUBLIC_AUTHRIM_CLIENT_ID=your-client-id
```

### 3. Configure Authrim Admin

In your Authrim Admin Dashboard, configure:

- **Redirect URI**: `http://localhost:5173/callback` (for local development)
- **Allowed Origins**: `http://localhost:5173`

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy to Cloudflare Pages

### Option 1: Git Integration

1. Push your code to GitHub
2. Go to Cloudflare Dashboard → Pages → Create a project
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework preset**: SvelteKit
   - **Build command**: `pnpm build`
   - **Build output directory**: `.svelte-kit/cloudflare`
5. Add environment variables:
   - `PUBLIC_AUTHRIM_ISSUER`
   - `PUBLIC_AUTHRIM_CLIENT_ID`

### Option 2: Direct Upload

```bash
pnpm build
npx wrangler pages deploy .svelte-kit/cloudflare
```

### Post-Deploy Configuration

Update your Authrim Admin settings:

- **Redirect URI**: `https://your-app.pages.dev/callback`
- **Allowed Origins**: `https://your-app.pages.dev`

## Project Structure

```
src/
├── app.d.ts              # TypeScript declarations
├── app.html              # HTML template
├── hooks.server.ts       # Server hooks (auth middleware)
├── lib/
│   ├── auth.ts           # Authrim client initialization
│   └── config.ts         # Configuration helpers
└── routes/
    ├── +layout.svelte    # Root layout with AuthProvider
    ├── +layout.server.ts # Server-side session loading
    ├── +page.svelte      # Home page
    ├── login/
    │   └── +page.svelte  # Login page
    ├── signup/
    │   └── +page.svelte  # Sign up page
    ├── callback/
    │   └── +page.svelte  # OAuth callback handler
    └── account/
        ├── +page.svelte      # Account settings (protected)
        └── +page.server.ts   # Auth guard
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Type-check the project

## Authentication Flow

### Passkey Login

1. User clicks "Continue with Passkey"
2. Browser shows WebAuthn prompt
3. On success, user is redirected to home

### Email Code Login

1. User enters email address
2. Verification code is sent to email
3. User enters 6-digit code
4. On verification, user is logged in

### Social Login

1. User clicks a social provider button
2. Popup opens for OAuth flow
3. On completion, popup closes and user is logged in

## UI Components Used

This example uses the following components from `@authrim/sveltekit/ui`:

- `Card`, `Button`, `Input` - Basic UI elements
- `EmailCodeForm` - Email/code input flow
- `SocialLoginButtons` - Social provider buttons
- `PasskeyConditionalInput` - Passkey input with conditional UI
- `PasskeyList`, `PasskeyRegisterButton` - Passkey management
- `SessionList` - Session management
- `AuthError`, `Spinner` - Feedback components
- `OTPInput`, `ResendCodeButton` - Code verification

## License

Apache-2.0
