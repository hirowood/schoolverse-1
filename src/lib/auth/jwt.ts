import jwt, { type JwtPayload as JWTPayload, type Secret, type SignOptions } from 'jsonwebtoken';

const SECRET: Secret = (process.env.JWT_SECRET as Secret) || 'change_me';
const DEFAULT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as unknown as SignOptions['expiresIn']) || '1d';

export type AuthTokenPayload = (JWTPayload & {
  sub: string;
  email?: string;
  displayName?: string;
});

export function signToken(
  payload: Omit<AuthTokenPayload, 'iat' | 'exp'>,
  opts?: { expiresIn?: SignOptions['expiresIn'] },
) {
  const options: SignOptions = {};
  options.expiresIn = opts?.expiresIn ?? DEFAULT_EXPIRES_IN;
  return jwt.sign(payload as object, SECRET, options);
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as AuthTokenPayload;
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
