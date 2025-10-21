import bcrypt from 'bcryptjs';

const COST = 10; // MVP: fixed cost per spec

export async function hashPassword(raw: string) {
  return bcrypt.hash(raw, COST);
}

export async function comparePassword(raw: string, hashed: string) {
  return bcrypt.compare(raw, hashed);
}
