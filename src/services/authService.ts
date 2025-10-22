import type { Session as PrismaSession } from '@prisma/client';
import { hashPassword, comparePassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { toSafeUser, type SafeUser } from '@/lib/auth/safeUser';
import { sessionRepository, userRepository } from '@/repositories';

const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7); // 7 days

type SignupPayload = {
  email: string;
  username: string;
  password: string;
  displayName?: string | null;
  avatarUrl?: string | null;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RefreshPayload = {
  refreshToken: string;
};

export type AuthResponse = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  session: PrismaSession;
};

export class AuthService {
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const existingByEmail = await userRepository.findByEmail(payload.email);
    if (existingByEmail) {
      throw new Error('EMAIL_EXISTS');
    }

    const existingByUsername = await userRepository.findByUsername(payload.username);
    if (existingByUsername) {
      throw new Error('USERNAME_EXISTS');
    }

    const passwordHash = await hashPassword(payload.password);

    const user = await userRepository.create({
      email: payload.email,
      username: payload.username,
      passwordHash,
      displayName: payload.displayName ?? null,
      avatarUrl: payload.avatarUrl ?? null,
      status: 'OFFLINE',
    });

    return this.createAuthResponse(user.id);
  }

  async login({ email, password }: LoginPayload): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    await userRepository.update(user.id, {
      lastLoginAt: new Date(),
      status: 'ONLINE',
    });

    return this.createAuthResponse(user.id);
  }

  async refresh({ refreshToken }: RefreshPayload): Promise<AuthResponse> {
    const session = await sessionRepository.findByRefreshToken(refreshToken);
    if (!session) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await sessionRepository.delete(session.id);
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }

    return this.createAuthResponse(session.userId, session.id);
  }

  async logout(userId: string): Promise<void> {
    await sessionRepository.deleteByUserId(userId);
    await userRepository.update(userId, {
      status: 'OFFLINE',
    });
  }

  private async createAuthResponse(userId: string, reuseSessionId?: string): Promise<AuthResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

    let session: PrismaSession;
    if (reuseSessionId) {
      session = await sessionRepository.update(reuseSessionId, {
        accessToken,
        refreshToken,
        expiresAt,
      });
    } else {
      session = await sessionRepository.create({
        user: { connect: { id: user.id } },
        accessToken,
        refreshToken,
        expiresAt,
      });
    }

    return {
      user: toSafeUser({
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        status: user.status,
      }),
      accessToken,
      refreshToken,
      session,
    };
  }

  async getSafeUser(userId: string): Promise<SafeUser | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;
    return toSafeUser({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      status: user.status,
    });
  }
}

export const authService = new AuthService();
