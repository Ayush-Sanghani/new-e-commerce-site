# Email Verification — Requirements

**Status:** Requirements only (no implementation)  
**Approach:** Same pattern as forgot password (token in DB → email with link → page/API to consume token)

---

## What we want

- User registers with email/password → gets a **verification link** by email (24h expiry).
- User **cannot log in** until email is verified.
- Google sign-in users are treated as already verified.
- Existing users are backfilled as verified so they are not locked out.

**Reference (copy this pattern):**

| Forgot password | Email verification |
|---------------|-------------------|
| `PasswordResetToken` | `EmailVerificationToken` |
| `lib/password-reset.ts` | `lib/email-verification.ts` |
| `sendPasswordResetEmail` | `sendVerificationEmail` |
| `POST /api/auth/forgot-password` | `POST /api/auth/resend-verification` |
| `POST /api/auth/reset-password` | `POST /api/auth/verify-email` |
| `/forgot-password` page | Register step 2 (“Check your email”) |
| `/reset-password?token=...` page | `/verify-email?token=...` page |

---

## Implementation steps

### Step 1 — Database

- Add `emailVerifiedAt DateTime?` on `User`.
- Add `EmailVerificationToken` model (same shape as `PasswordResetToken`: `userId`, `tokenHash`, `expiresAt`).
- Run migration.
- Backfill: set `emailVerifiedAt = createdAt` for all existing users.

### Step 2 — Token helper (`lib/email-verification.ts`)

Mirror `lib/password-reset.ts`:

- `createEmailVerificationToken()` — raw token + hash + expiry (24 hours)
- `hashEmailVerificationToken()`
- `buildVerifyEmailUrl(rawToken)` → `{APP_URL}/verify-email?token=...`
- `isEmailVerificationTokenExpired()`

### Step 3 — Email (`lib/email.ts`)

- Add `sendVerificationEmail({ to, verifyUrl, name })` using Resend (same as password reset).
- Uses existing env: `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`.

### Step 4 — Update register API (`POST /api/auth/register`)

- Create user with `emailVerifiedAt = null`.
- Create verification token in DB.
- Send verification email.
- **Do not** set auth cookie (user is not logged in yet).
- Return success so UI can show step 2.

### Step 5 — Verify API (`POST /api/auth/verify-email`)

Mirror `POST /api/auth/reset-password`:

- Accept `token` in body (or handle via page that calls this API).
- Find token by hash, check expiry.
- Set `user.emailVerifiedAt = now()`, delete token.
- Log user in (attach auth cookie) and return success.

### Step 6 — Resend API (`POST /api/auth/resend-verification`)

Mirror `POST /api/auth/forgot-password`:

- Accept `email`.
- If user exists and is unverified → delete old tokens, create new one, send email.
- Always return generic success message (do not reveal if email exists).
- Add rate limit in `lib/rate-limit.ts`.

### Step 7 — Update login API (`POST /api/auth/login`)

- After password check, if `emailVerifiedAt` is null → return error: “Please verify your email.”
- Verified users login as today.

### Step 8 — Google OAuth

- On Google user create/link, set `emailVerifiedAt = now()`.

### Step 9 — UI

- **`app/register/page.tsx`** — on success, show step 2 (“Check your email”) + resend button; step 3 after verify.
- **`app/verify-email/page.tsx`** — read `token` from URL, call verify API, show success/error (like `reset-password` page).
- **`app/login/page.tsx`** — show message when login fails due to unverified email.

### Step 10 — Rate limiting

Add to `lib/rate-limit.ts`:

- `resend-verification` (same limits as `forgot-password`)
- `verify-email` (same limits as `reset-password`)

---

## Decisions (locked)

| Item | Choice |
|------|--------|
| Verify method | **Link** (not OTP) |
| Token expiry | **24 hours** |
| Login before verify | **No** |
| After verify link clicked | **Auto-login** |
| Google users | **Verified automatically** |

---

## Done when

- [ ] Register sends email; user stays on “verify email” step
- [ ] Link verifies account and logs user in
- [ ] Unverified user cannot login
- [ ] Resend works with rate limit
- [ ] Google users skip verification
- [ ] Existing users still can login
