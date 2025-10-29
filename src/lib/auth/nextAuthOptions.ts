import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AuthService } from "@/services/authService";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const service = new AuthService();
        try {
          const { user } = await service.login({
            email: String(credentials.email),
            password: String(credentials.password),
          });
          return {
            id: user.id,
            email: user.email,
            name: user.displayName ?? user.username,
            username: user.username,
            displayName: user.displayName ?? null,
          } as any;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.displayName = (user as any).displayName ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string | undefined;
        (session.user as any).username = token.username as string | undefined;
        (session.user as any).displayName = token.displayName as string | null | undefined;
      }
      return session;
    },
  },
  // Ensure secret is set via env
  secret: process.env.NEXTAUTH_SECRET,
};

export default authConfig;

