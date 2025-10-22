import jwt, { type JwtPayload as JWTPayload, type Secret, type SignOptions } from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET: Secret =
  (process.env.ACCESS_TOKEN_SECRET as Secret) || (process.env.JWT_SECRET as Secret) || 'dev_access_secret';
const REFRESH_TOKEN_SECRET: Secret =
  (process.env.REFRESH_TOKEN_SECRET as Secret) || (process.env.JWT_REFRESH_SECRET as Secret) || 'dev_refresh_secret';

const DEFAULT_ACCESS_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.ACCESS_TOKEN_EXPIRES_IN as unknown as SignOptions['expiresIn']) || '15m';
const DEFAULT_REFRESH_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.REFRESH_TOKEN_EXPIRES_IN as unknown as SignOptions['expiresIn']) || '7d';

export type AuthTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  username?: string;
  displayName?: string | null;
};

export function signAccessToken(
  payload: Omit<AuthTokenPayload, 'iat' | 'exp'>,
  opts?: { expiresIn?: SignOptions['expiresIn'] },
) {
  const options: SignOptions = {
    expiresIn: opts?.expiresIn ?? DEFAULT_ACCESS_EXPIRES_IN,
  };
  return jwt.sign(payload as object, ACCESS_TOKEN_SECRET, options);
}

export function signRefreshToken(
  payload: Omit<AuthTokenPayload, 'iat' | 'exp'>,
  opts?: { expiresIn?: SignOptions['expiresIn'] },
) {
  const options: SignOptions = {
    expiresIn: opts?.expiresIn ?? DEFAULT_REFRESH_EXPIRES_IN,
  };
  return jwt.sign(payload as object, REFRESH_TOKEN_SECRET, options);
}

export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromAuthHeader(authorization?: string | null): string | null {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}
