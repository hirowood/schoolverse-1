export type UserStatus = 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY';

export type User = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  avatarConfig?: unknown;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = Pick<User, 'id' | 'email' | 'username' | 'displayName' | 'avatarUrl' | 'status'>;
