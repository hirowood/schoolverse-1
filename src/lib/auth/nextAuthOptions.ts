type CredentialsProviderLike = (opts: {
  name: string;
  credentials: Record<string, { label: string; type: string }>;
  authorize: (credentials: Record<string, unknown> | undefined) => Promise<MinimalUser | null>;
}) => unknown;

// Load provider at runtime to avoid type-resolution issues in constrained envs
const Credentials: CredentialsProviderLike = (() => {
  if (process.env.SKIP_NEXT_AUTH_PROVIDER === "true") {
    return (((opts: Parameters<CredentialsProviderLike>[0]) => opts) as unknown) as CredentialsProviderLike;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("next-auth/providers/credentials");
    return (mod.default ?? mod) as CredentialsProviderLike;
  } catch {
    // Fallback no-op provider for type-checking in environments without next-auth types
    return (((opts: Parameters<CredentialsProviderLike>[0]) => opts) as unknown) as CredentialsProviderLike;
  }
})();
import { AuthService } from "@/services/authService";

type MinimalToken = {
  id?: string;
  username?: string | null;
  displayName?: string | null;
  roles?: string[] | null;
  permissions?: string[] | null;
  // allow arbitrary fields
  [key: string]: unknown;
};

type MinimalUser = {
  id: string;
  email?: string | null;
  username?: string | null;
  displayName?: string | null;
  roles?: string[] | null;
  permissions?: string[] | null;
  [key: string]: unknown;
};

type JWTCallbackArgs = { token: MinimalToken; user?: MinimalUser | null };
type SessionCallbackArgs = { session: { user?: MinimalUser | null }; token: MinimalToken };

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: Record<string, unknown> | undefined) => {
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
            roles: user.roles ?? null,
            permissions: user.permissions ?? null,
          } as MinimalUser;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: JWTCallbackArgs) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? null;
        token.displayName = user.displayName ?? null;
        token.roles = user.roles ?? null;
        token.permissions = user.permissions ?? null;
      }
      return token;
    },
    async session({ session, token }: SessionCallbackArgs) {
      if (session.user) {
        session.user.id = token.id ?? session.user.id;
        session.user.username = (token.username ?? session.user.username) ?? null;
        session.user.displayName = (token.displayName ?? session.user.displayName) ?? null;
        session.user.roles = token.roles ?? null;
        session.user.permissions = token.permissions ?? null;
      }
      return session;
    },
  },
  // Ensure secret is set via env
  secret: process.env.NEXTAUTH_SECRET,
} satisfies Record<string, unknown>;

export default authConfig;
