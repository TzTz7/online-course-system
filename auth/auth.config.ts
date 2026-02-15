import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const protectedRoutes = ['/courses', '/exams', '/materials', '/classroom', '/chatroom', '/ai-tutor', '/ai-roles'];
      const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));
      
      const isAuthRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      } else if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id!;
        session.user.role = token.role!;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
