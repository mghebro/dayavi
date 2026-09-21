import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    newUser: "/app",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAppRoute = nextUrl.pathname.startsWith("/app");
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register") ||
        nextUrl.pathname.startsWith("/forgot-password") ||
        nextUrl.pathname.startsWith("/reset-password") ||
        nextUrl.pathname.startsWith("/verify-email");

      if (isAppRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to signIn page
      } else if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/app", nextUrl));
        }
        return true;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Initialized with full providers in src/lib/auth/auth.ts
};
