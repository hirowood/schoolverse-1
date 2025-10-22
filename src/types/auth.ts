/**
 * Shared authentication-related types that can be reused across
 * backend services, API routes, and frontend consumers.
 * Keeping these definitions in one place helps newcomers quickly
 * understand the data exchanged during the auth flow.
 */
import type { SafeUser } from '@/lib/auth/safeUser';

export type SignupPayload = {
  email: string;
  username: string;
  password: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RefreshPayload = {
  refreshToken: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  /**
   * Absolute expiry (epoch milliseconds) used by the client for proactive renewal.
   * This field is optional because not every call needs to expose it.
   */
  refreshExpiresAt?: number;
};

export type AuthResult = {
  user: SafeUser;
  tokens: AuthTokens;
  sessionId: string;
};
