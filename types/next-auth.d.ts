import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: 'student' | 'teacher' | 'admin';
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role: 'student' | 'teacher' | 'admin';
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: 'student' | 'teacher' | 'admin';
  }
}
