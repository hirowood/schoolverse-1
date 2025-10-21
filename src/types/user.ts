export type UserStatus = 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY';

export type User = {
  id: string;
  email: string;
  displayName: string;
  avatarConfig?: unknown;
  status: UserStatus;
};
