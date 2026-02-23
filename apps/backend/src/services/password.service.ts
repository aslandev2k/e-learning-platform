import { compare, hash } from 'bcryptjs';

function hashPassword(originPassword: string): Promise<string> {
  return hash(originPassword, 13);
}

async function verify(originPassword: string, hashedPassword: string) {
  const passwordMatched = await compare(originPassword, hashedPassword);
  return { passwordMatched };
}

export const PasswordService = {
  hashPassword,
  verify,
};
