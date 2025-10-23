import { describe, it, expect, beforeEach, vi } from "vitest";

// モックを先に定義することで、AuthService から参照される依存を差し替える
vi.mock("@/repositories", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findOnlineUsers: vi.fn(),
  },
  sessionRepository: {
    create: vi.fn(),
    update: vi.fn(),
    findByRefreshToken: vi.fn(),
    findByAccessToken: vi.fn(),
    delete: vi.fn(),
    deleteByUserId: vi.fn(),
  },
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(async (value: string) => `hashed:${value}`),
  comparePassword: vi.fn(async () => true),
}));

vi.mock("@/lib/auth/jwt", () => ({
  signAccessToken: vi.fn(() => "access-token"),
  signRefreshToken: vi.fn(() => "refresh-token"),
  verifyAccessToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
  getTokenFromAuthHeader: vi.fn(),
}));

import { authService } from "@/services/authService";
import { userRepository, sessionRepository } from "@/repositories";
import { hashPassword, comparePassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import type { Session, User } from "@prisma/client";
import { UserStatus } from "@prisma/client";

const mockedUserRepository = vi.mocked(userRepository);
const mockedSessionRepository = vi.mocked(sessionRepository);
const hashPasswordMock = vi.mocked(hashPassword);
const comparePasswordMock = vi.mocked(comparePassword);
const signAccessTokenMock = vi.mocked(signAccessToken);
const signRefreshTokenMock = vi.mocked(signRefreshToken);

describe("AuthService", () => {
  const baseUser: User = {
    id: "user-1",
    email: "user@example.com",
    username: "user1",
    passwordHash: "hashed:password",
    displayName: "User One",
    avatarUrl: null,
    avatarConfig: null,
    status: UserStatus.OFFLINE,
    lastLoginAt: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };

  const baseSession: Session = {
    id: "session-1",
    userId: baseUser.id,
    refreshToken: "refresh-token",
    accessToken: "access-token",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 各テストのデフォルト戻り値をセット
    mockedUserRepository.findByEmail.mockResolvedValue(null);
    mockedUserRepository.findByUsername.mockResolvedValue(null);
    mockedUserRepository.create.mockResolvedValue({ ...baseUser });
    mockedUserRepository.findById.mockResolvedValue({ ...baseUser });
    mockedUserRepository.update.mockResolvedValue({ ...baseUser });

    mockedSessionRepository.create.mockResolvedValue({ ...baseSession });
    mockedSessionRepository.update.mockResolvedValue({ ...baseSession });
    mockedSessionRepository.findByRefreshToken.mockResolvedValue({ ...baseSession });

    hashPasswordMock.mockResolvedValue("hashed:password");
    comparePasswordMock.mockResolvedValue(true);
    signAccessTokenMock.mockReturnValue("access-token");
    signRefreshTokenMock.mockReturnValue("refresh-token");
  });

  it("signs up a new user", async () => {
    const result = await authService.signup({
      email: "new@example.com",
      username: "new-user",
      password: "secret",
      displayName: "New User",
    });

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith("new@example.com");
    expect(hashPasswordMock).toHaveBeenCalledWith("secret");
    expect(mockedSessionRepository.create).toHaveBeenCalled();
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
    expect(result.user).toMatchObject({ email: baseUser.email, username: baseUser.username });
  });

  it("throws if email already exists", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue({ ...baseUser });

    await expect(
      authService.signup({ email: baseUser.email, username: "another", password: "secret" }),
    ).rejects.toThrowError("EMAIL_EXISTS");
  });

  it("throws if username already exists", async () => {
    mockedUserRepository.findByUsername.mockResolvedValue({ ...baseUser, email: "other@example.com" });

    await expect(
      authService.signup({ email: "another@example.com", username: baseUser.username, password: "secret" }),
    ).rejects.toThrowError("USERNAME_EXISTS");
  });

  it("fails login when password is invalid", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue({ ...baseUser });
    comparePasswordMock.mockResolvedValue(false);

    await expect(authService.login({ email: baseUser.email, password: "wrong" })).rejects.toThrowError(
      "INVALID_CREDENTIALS",
    );
  });

  it("refreshes tokens when session is valid", async () => {
    const result = await authService.refresh({ refreshToken: "refresh-token" });

    expect(mockedSessionRepository.update).toHaveBeenCalled();
    expect(result.accessToken).toBe("access-token");
  });

  it("fails refresh when session expired", async () => {
    const expired: Session = { ...baseSession, expiresAt: new Date(Date.now() - 1000) };
    mockedSessionRepository.findByRefreshToken.mockResolvedValue(expired);

    await expect(authService.refresh({ refreshToken: "refresh-token" })).rejects.toThrowError(
      "REFRESH_TOKEN_EXPIRED",
    );
    expect(mockedSessionRepository.delete).toHaveBeenCalledWith(expired.id);
  });

  it("logs out user by clearing sessions and status", async () => {
    await authService.logout(baseUser.id);

    expect(mockedSessionRepository.deleteByUserId).toHaveBeenCalledWith(baseUser.id);
    expect(mockedUserRepository.update).toHaveBeenCalledWith(baseUser.id, { status: "OFFLINE" });
  });
});
