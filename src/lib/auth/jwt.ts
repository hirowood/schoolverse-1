import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const SECRET = process.env.JWT_SECRET || 'change_me';

export type JwtPayload = {
  sub: string; // user id
  email?: string;
  displayName?: string;
  iat?: number;
  exp?: number;
};

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, opts?: { expiresIn?: string | number }) {
  return jwt.sign(payload, SECRET, { expiresIn: opts?.expiresIn ?? DEFAULT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
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
