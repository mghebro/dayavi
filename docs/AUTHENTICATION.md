# Dayavi (დაყავი) — Authentication Architecture

## 1. Authentication System Overview

Authentication in Dayavi is implemented with **Auth.js (NextAuth v5)** leveraging the Next.js App Router.
Supported authentication methods:
* **Credentials (Email & Password)**: Strongly hashed with `bcryptjs` (salt rounds: 12).
* **Google OAuth**: One-click social sign-in via Google Identity Services.
* **GitHub OAuth**: Developer-friendly authentication via GitHub OAuth Apps.
* *(Note: Apple Authentication is explicitly omitted per prompt instructions).*

All OAuth secrets and private keys are read strictly from environment variables and never exposed to the client bundle.

---

## 2. Authentication Flows

### 2.1 Registration Flow
1. User submits name, email, and password on `/register`.
2. Server Action validates input against Zod schema (email format, password entropy $\ge 8$ chars).
3. Check for existing user with same email (prevent duplicates or prompt OAuth linking).
4. Password hashed using `bcryptjs.hash(password, 12)`.
5. User entity created in database with `emailVerified = null`.
6. Email verification token generated and dispatched via `EmailService`.
7. Client is redirected to `/verify-email?email=...` with instructions.

### 2.2 Login & Session Lifecycle
* Handled via Auth.js `signIn("credentials", { email, password, redirect: false })` or social triggers.
* Sessions use JSON Web Tokens (JWT) stored in HTTP-only, secure, SameSite cookies.
* JWT callbacks augment the session token with `userId`, `name`, `email`, and `avatar`.

```typescript
// auth.config.ts session callback
async session({ session, token }) {
  if (token?.sub) {
    session.user.id = token.sub;
  }
  return session;
}
```

### 2.3 Password Reset Flow
1. User submits email at `/forgot-password`.
2. Constant-time response returned to prevent user enumeration attacks (*"If an account exists, a reset link was sent"*).
3. If user exists, create a cryptographic random token (`crypto.randomBytes(32).toString("hex")`) with 1-hour expiry in `PasswordResetToken`.
4. Send email containing reset URL: `/reset-password?token=XYZ`.
5. Reset page validates token validity and expiration.
6. Upon submission, user's `hashedPassword` is updated, and all reset tokens for that user are invalidated.

### 2.4 Email Verification Flow
1. Verification token contains hashed random secret with 24-hour expiration.
2. User navigates to `/verify-email?token=XYZ`.
3. Server Action verifies token existence and validity, updates `User.emailVerified = new Date()`, and deletes the token.

---

## 3. Middleware & Route Protection (`middleware.ts`)

Dayavi enforces edge middleware to verify sessions before protected pages or server resources are accessed:

```typescript
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") ||
                      req.nextUrl.pathname.startsWith("/register") ||
                      req.nextUrl.pathname.startsWith("/forgot-password") ||
                      req.nextUrl.pathname.startsWith("/reset-password");
  const isAppRoute = req.nextUrl.pathname.startsWith("/app");

  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(new URL("/app", req.nextUrl));
  }

  if (!isLoggedIn && isAppRoute) {
    let callbackUrl = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      callbackUrl += req.nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
```

---

## 4. Security & Sanitization Policies
* **No Sensitive Data Leaks**: Passwords and hashed passwords are excluded from Prisma select queries by default and never passed to Client Components.
* **Brute-Force Protection**: Rate limiting on authentication endpoints to prevent credential stuffing.
* **OAuth State Verification**: State cookies ensure protection against CSRF in OAuth handshakes.
